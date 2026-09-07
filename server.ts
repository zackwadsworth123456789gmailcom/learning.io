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
