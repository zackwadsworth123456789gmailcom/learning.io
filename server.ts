import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  // Lazy initialize Gemini client using recommended pattern
  let ai: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    if (!ai && process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return ai;
  }

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Google Autocomplete Suggestions Endpoint
  app.get('/api/google/suggest', async (req, res) => {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json({ suggestions: [] });
    }
    try {
      const resp = await fetch(
        `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(q)}`
      );
      if (resp.ok) {
        const data = (await resp.json()) as any;
        if (Array.isArray(data) && Array.isArray(data[1])) {
          return res.json({ suggestions: data[1].slice(0, 8) });
        }
      }
    } catch (err) {
      // Fallback
    }
    res.json({ suggestions: [] });
  });

  // Local semantic matcher fallback
  function performLocalSemanticSearch(query: string, games: any[]) {
    const q = query.toLowerCase();
    const tokens = q.split(/\s+/).filter((t: string) => t.length > 1);

    const scored = games.map((game: any) => {
      let score = 50;
      const reasons: string[] = [];

      const titleLower = (game.title || '').toLowerCase();
      const catLower = (game.category || '').toLowerCase();
      const descLower = (game.description || '').toLowerCase();
      const controlsLower = (game.controls || '').toLowerCase();

      // Check tokens
      for (const token of tokens) {
        if (titleLower.includes(token)) {
          score += 25;
          reasons.push(`Title matches "${token}"`);
        }
        if (catLower.includes(token)) {
          score += 20;
          reasons.push(`Category matches "${game.category}"`);
        }
        if (descLower.includes(token)) {
          score += 15;
          reasons.push(`Gameplay features "${token}"`);
        }
        if (controlsLower.includes(token)) {
          score += 10;
          reasons.push(`Input matches "${token}"`);
        }
      }

      // Domain heuristics
      if ((q.includes('fast') || q.includes('slope') || q.includes('speed') || q.includes('run') || q.includes('dodge') || q.includes('reflex')) && (game.id === 'slope' || game.id === 'flappy-bird' || game.category === 'Action')) {
        score += 35;
        reasons.push('High-speed reflex 3D action');
      }
      if ((q.includes('puzzle') || q.includes('brain') || q.includes('logic') || q.includes('think') || q.includes('math') || q.includes('grid')) && (game.category === 'Puzzle' || game.id === '2048' || game.id === 'tetris')) {
        score += 35;
        reasons.push('Mental strategy & puzzle solving');
      }
      if ((q.includes('retro') || q.includes('classic') || q.includes('80s') || q.includes('90s') || q.includes('arcade') || q.includes('nostalgic')) && (game.category === 'Arcade' || ['pacman', 'space-invaders', 'pong', 'breakout', 'snake'].includes(game.id))) {
        score += 35;
        reasons.push('Classic golden-era arcade experience');
      }
      if ((q.includes('arrow') || q.includes('keyboard') || q.includes('keys')) && controlsLower.includes('arrow')) {
        score += 20;
        reasons.push('Arrow keys navigation support');
      }

      const matchScore = Math.min(Math.max(score, 52), 98);
      return {
        id: game.id,
        matchScore,
        reason: reasons.length > 0 ? reasons.slice(0, 2).join(' • ') : `Top rated ${game.category} game.`,
        highlightFeature: game.category,
      };
    });

    return scored
      .filter((s: any) => s.matchScore > 50)
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 6);
  }

  // AI Q&A Endpoint - Answers questions directly
  app.post('/api/ai/ask', async (req, res) => {
    try {
      const { question, history } = req.body;
      if (!question || typeof question !== 'string' || !question.trim()) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const q = question.trim();
      const client = getAI();

      if (!client) {
        // High quality offline fallback answer generator for common gaming/coding/trivia questions
        const offlineAnswer = generateOfflineAnswer(q);
        return res.json({
          answer: offlineAnswer,
          model: 'offline-arcade-ai',
          source: 'offline',
        });
      }

      // Build contents array if history exists
      let contents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        // Take up to last 6 messages
        const recentHistory = history.slice(-6);
        for (const item of recentHistory) {
          contents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.text }],
          });
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: q }],
      });

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction: `You are an expert, friendly, and articulate problem-solving AI Assistant.
Your primary objective is to SOLVE QUESTIONS directly, accurately, and step-by-step WITHOUT PROVIDING CODE.

CRITICAL INSTRUCTION - NO CODE RULE:
- DO NOT provide programming code, scripts, or code blocks in any programming language (NO JavaScript, Python, C++, HTML, CSS, pseudo-code, etc.).
- Even if the user asks for code, programming scripts, or how to build something, DO NOT output programming code or code syntax. Instead, solve the problem conceptually: explain the algorithmic logic, step-by-step methodology, architecture, mathematical formulas, and concepts in plain, articulate English.
- NEVER include markdown fenced code blocks (like \`\`\`javascript, \`\`\`python, \`\`\`html, etc.).

What you solve:
- Mathematics & Calculations: Provide step-by-step working, clear formulas in plain text, intermediate steps, and the final answer clearly highlighted.
- Logic Puzzles, Riddles & Brainteasers: Break down the deductive reasoning clearly.
- Science & Physics: Explain the laws, formulas, variables, and solutions step-by-step.
- Gaming Strategy, Mechanics & Tips: Provide optimal tactics, pathing, timing, angles, and strategies (e.g. Slope, 2048, Tetris, Snake, Among Us).
- General Knowledge & Homework: Deliver direct, well-reasoned answers to any question asked.

Style & Formatting:
- Always give the direct answer and solution clearly.
- Use clean Markdown: bold key results, numbered step-by-step lists, and bulleted takeaways.
- Be concise, educational, and helpful.`,
        },
      });

      const answerText = response.text || 'I was unable to generate an answer. Please try asking again!';
      return res.json({
        answer: answerText,
        model: 'gemini-3.8-flash',
        source: 'gemini',
      });
    } catch (err: any) {
      console.error('Error handling /api/ai/ask:', err);
      // Fall back gracefully to offline answer
      const q = (req.body?.question || '').toString();
      const fallback = generateOfflineAnswer(q);
      return res.json({
        answer: fallback,
        model: 'offline-fallback',
        source: 'fallback',
        note: 'Generated via arcade offline knowledge base.',
      });
    }
  });

  // Helper for offline question answering (strictly no code)
  function generateOfflineAnswer(q: string): string {
    const query = q.toLowerCase();

    // Check for math or algebraic questions
    if (query.includes('3x') || (query.includes('solve') && query.includes('='))) {
      return `### Step-by-Step Algebraic Solution

**Problem**: Solve for the unknown variable *x*.

1. **Isolate the Variable Term**: Subtract the constant term from both sides of the equation to keep terms with *x* on one side.
2. **Simplify**: Perform the arithmetic subtraction on the right-hand side.
3. **Divide by the Coefficient**: Divide both sides by the number multiplying *x* to get *x* by itself.
4. **Verification**: Substitute your answer back into the original equation to confirm that the left-hand side equals the right-hand side.

**Example**: For $3x + 12 = 39$:
- Subtract 12 from both sides: $3x = 27$
- Divide by 3: $x = 9$
- Check: $3(9) + 12 = 27 + 12 = 39$ ✓`;
    }

    if (query.includes('pythagorean') || query.includes('triangle')) {
      return `### Pythagorean Theorem: Step-by-Step Solution

**Formula**: $a^2 + b^2 = c^2$ (where *a* and *b* are the perpendicular legs, and *c* is the hypotenuse).

**Step-by-Step Solution (for a triangle with legs 3 and 4)**:
1. **Square leg a**: $3^2 = 9$
2. **Square leg b**: $4^2 = 16$
3. **Add the squares**: $9 + 16 = 25$
4. **Take the square root of the sum**: $\\sqrt{25} = 5$

**Result**: The hypotenuse length is **5**.`;
    }

    if (query.includes('bat') && query.includes('ball')) {
      return `### Solution to the Bat and Ball Logic Puzzle

**Puzzle**: A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?

**Common Intuitive Trap**: Many people guess $0.10, but if the ball were $0.10, the bat ($1.00 more) would cost $1.10, making the total $1.20.

**Mathematical Solution**:
1. Let the ball cost $x$.
2. The bat costs $x + 1.00$.
3. Total equation: $x + (x + 1.00) = 1.10$
4. Combine like terms: $2x + 1.00 = 1.10$
5. Subtract $1.00 from both sides: $2x = 0.10$
6. Divide by 2: $x = 0.05$

**Final Answer**: The ball costs **$0.05 (5 cents)**, and the bat costs **$1.05**. Total = $1.10.`;
    }

    if (query.includes('slope')) {
      return `### How to Master Slope & Reach 100+ Score (Solution & Technique)

1. **Center of Mass Rule**: Always steer toward the middle third of each platform. Edges have steeper dropoffs and narrow hitboxes that trigger boundary falls.
2. **Feather Key Taps**: Never hold down directional keys continuously. Use rapid, micro-taps to maintain trajectory balance.
3. **Look 2 to 3 Tiles Ahead**: Fix your gaze on upcoming obstacles rather than on your ball. This gives your brain 300–400ms more reaction time.
4. **Preserve Neutral Momentum in Mid-Air**: Avoid steering while airborne after a ramp jump. Let physics complete the arc, and steer only when contact with the surface is re-established.`;
    }

    if (query.includes('2048')) {
      return `### 2048 Winning Strategy (The Corner Lock Method)

1. **Choose One Fixed Corner**: Pick the bottom-left or bottom-right corner and NEVER press the opposite direction (e.g., if bottom-left is chosen, never press Up or Right).
2. **Establish a Monotonic Gradient**: Arrange your numbers along the bottom wall in strictly descending order from largest to smallest (e.g., 1024, 512, 256, 128).
3. **Lock the Base Row**: Always keep all four cells of your anchor row occupied with tiles so your high-value anchor cannot be shifted sideways.
4. **Cascade Merges from Above**: Form intermediate merges in the top two rows and filter them downward into your main chain.`;
    }

    if (query.includes('tetris')) {
      return `### Tetris Stacking Solution & Strategy

1. **The 9-0 Column Stacking Rule**: Build a level, flat stack across columns 1 through 9, leaving column 10 open as an unobstructed vertical shaft for the 4-line I-piece.
2. **Keep the Skyline Flat**: Never allow individual columns to spike higher than 2 blocks above neighboring columns. A flat surface maximizes placement flexibility for any piece.
3. **Manage the Hold Queue**: Store an I-piece or T-piece in reserve for emergencies or for executing a 4-line Tetris clear.
4. **Pre-plan Using Next Preview**: Look at least 2 pieces ahead in the queue before dropping your active piece.`;
    }

    if (query.includes('snake')) {
      return `### Snake Strategy for Maximum Length (The Hamiltonian Cycle)

1. **Serpentine Zigzag Pattern**: Traverse the grid in a continuous S-curve back and forth across columns. This systematically covers the board without crossing your own trail.
2. **Perimeter Return Path**: Dedicate one outer edge (e.g., the top or left border) strictly as an open return highway to reset your position after collecting food.
3. **Avoid Blind Coils**: Never dart into a loop or enclosed quadrant where the exit can be blocked by your trailing body.`;
    }

    if (query.includes('among us') || query.includes('sus') || query.includes('impostor')) {
      return `### Among Us Tactical Deduction Guide

**For Crewmates**:
1. **Buddy System**: Pair up with players whose innocence has been proven through visual tasks (like MedBay Scan or Asteroids).
2. **Task Bar Timing**: Observe whether the green task bar increases when a player finishes interacting with a task station.
3. **Venting Routes**: Familiarize yourself with vent connections (e.g., Electrical to MedBay to Security) to catch rapid teleports.

**For Impostors**:
1. **Prepare Alibis in Advance**: Establish where you claim to have been before committing a kill.
2. **Opposite-Side Sabotage**: Trigger an oxygen or reactor emergency on the opposite side of the map to draw players away from a body.
3. **Fake Multi-Step Tasks Correctly**: Do not fake one-step tasks in rooms that require a sequence.`;
    }

    if (query.includes('game') || query.includes('dev') || query.includes('code') || query.includes('canvas')) {
      return `### How 2D Arcade Games Work Conceptually (Without Code)

To understand how games like Pong, Asteroids, or Snake run under the hood, here is the core structural logic:

1. **The Continuous Game Loop**:
   - The computer runs a cycle 60 times per second (approximately every 16 milliseconds).
   - In each frame, three things happen sequentially: **Process Input** → **Update State** → **Draw Visuals**.

2. **State Management**:
   - The game remembers the player's position $(x, y)$, speed $(vx, vy)$, score, and obstacle coordinates.
   - On each tick, position is updated: $x = x + vx$.

3. **Collision Detection**:
   - **Bounding Box (AABB)**: Checks if the rectangular boundaries of two sprites overlap on both horizontal and vertical axes.
   - **Distance Formula**: For circular objects (like balls), calculate the Euclidean distance between centers: $\\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$. If distance is less than the sum of their radii $(r_1 + r_2)$, a collision has occurred.

4. **Screen Refresh**:
   - The previous frame is cleared, and all entities are redrawn at their newly calculated positions, creating the illusion of smooth motion.`;
    }

    // General problem-solving fallback
    return `### Solution to: "${q}"

Here is the structured, step-by-step breakdown to solve this question:

1. **Identify the Core Objective**: Determine the exact unknown variable, goal, or condition required.
2. **Analyze the Variables & Constraints**: Separate given facts from assumptions.
3. **Apply the Underlying Principle**: Use the relevant scientific, mathematical, or logical rules to deduce the answer.
4. **Synthesize the Conclusion**: Verify that the result satisfies all original criteria.

If you have a specific math problem, logic riddle, or gameplay dilemma, type it in and I will solve it step-by-step!`;
  }

  // AI Semantic Game Search Endpoint
  app.post('/api/ai/search', async (req, res) => {
    try {
      const { query, games } = req.body;
      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const client = getAI();
      const catalog = Array.isArray(games) ? games : [];

      if (!client) {
        const localMatches = performLocalSemanticSearch(query, catalog);
        return res.json({
          source: 'local_semantic',
          model: 'local-hybrid-semantic',
          aiSummary: `Matched ${localMatches.length} games based on genre, controls, and gameplay descriptions.`,
          matchedGames: localMatches,
          suggestedCustomIdeas: [
            {
              title: "Retro Space Lander",
              genre: "Action/Arcade",
              concept: "Use arrow keys and thrusters to navigate tricky gravity caves without crashing."
            }
          ],
        });
      }

      const catalogSummary = catalog.map((g: any) => ({
        id: g.id,
        title: g.title,
        category: g.category,
        description: g.description,
        controls: g.controls || '',
        rating: g.rating || 4.8,
      }));

      const prompt = `You are the AI game search and recommendation engine for an unblocked arcade website.
A user entered the search prompt:
"${query.trim()}"

Here is the current catalog of playable iframe games:
${JSON.stringify(catalogSummary, null, 2)}

Instructions:
1. Understand the user's intent (genre, controls, pacing, mood, nostalgic era, difficulty).
2. Select and rank the best matching games from the catalog (up to 6 games).
   - "id": EXACT matching game id from the catalog.
   - "matchScore": integer between 60 and 99 representing relevance percentage.
   - "reason": concise explanation (1-2 sentences) of why this game satisfies the prompt.
   - "highlightFeature": short 2-3 word tag (e.g. "Lightning Reflexes", "Tactical Puzzle", "Retro Classic").
3. Provide an "aiSummary": 1-2 friendly sentences explaining the curated picks.
4. Provide 1-2 "suggestedCustomIdeas": ideas for custom unblocked HTML5 games they can build in JS TryIt or embed.

Respond STRICTLY in JSON:
{
  "aiSummary": "string",
  "matchedGames": [
    {
      "id": "string",
      "matchScore": 95,
      "reason": "string",
      "highlightFeature": "string"
    }
  ],
  "suggestedCustomIdeas": [
    {
      "title": "string",
      "genre": "string",
      "concept": "string"
    }
  ]
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are an intelligent gaming curator. Always return strictly valid JSON matching the specified schema.',
        },
      });

      const responseText = response.text || '{}';
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('Could not parse Gemini response as JSON', parseError);
        parsedData = {
          aiSummary: 'Here are games matching your query:',
          matchedGames: performLocalSemanticSearch(query, catalog),
          suggestedCustomIdeas: [],
        };
      }

      // Ensure matched game ids exist in catalog
      const validMatchedGames = (parsedData.matchedGames || []).filter((mg: any) =>
        catalog.some((cg: any) => cg.id === mg.id)
      );

      // If Gemini returned no valid IDs, fall back gracefully
      const finalMatchedGames = validMatchedGames.length > 0
        ? validMatchedGames
        : performLocalSemanticSearch(query, catalog);

      return res.json({
        source: 'gemini',
        model: 'gemini-3.8-flash',
        aiSummary: parsedData.aiSummary || `Found ${finalMatchedGames.length} matching games.`,
        matchedGames: finalMatchedGames,
        suggestedCustomIdeas: parsedData.suggestedCustomIdeas || [],
      });
    } catch (err: any) {
      console.error('Error handling /api/ai/search:', err);
      const catalog = Array.isArray(req.body?.games) ? req.body.games : [];
      const fallbackMatches = performLocalSemanticSearch(req.body?.query || '', catalog);
      return res.json({
        source: 'fallback',
        model: 'local-semantic',
        aiSummary: `Curated ${fallbackMatches.length} games based on your search terms.`,
        matchedGames: fallbackMatches,
        suggestedCustomIdeas: [],
      });
    }
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Arcade server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
