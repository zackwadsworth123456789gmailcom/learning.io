import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Arcade ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('unblocked_favorites');
      localStorage.removeItem('unblocked_custom_games');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center text-zinc-200">
          <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">Arcade Boot Error</h2>
            <p className="mt-2 text-xs text-zinc-400">
              The arcade interface encountered an unexpected rendering error.
            </p>
            {this.state.error?.message && (
              <pre className="mt-3 overflow-x-auto rounded bg-zinc-950 p-2 text-left font-mono text-[11px] text-rose-400 border border-zinc-800/80">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
              >
                Reload Arcade
              </button>
              <button
                onClick={this.handleReset}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-750 transition-colors cursor-pointer"
              >
                Reset Stored Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
