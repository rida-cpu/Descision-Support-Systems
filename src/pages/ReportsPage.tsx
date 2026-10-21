import React from 'react';

interface Props { children: React.ReactNode; onReset?: () => void; }
interface State { hasError: boolean; }

export class PageErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Page crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-slate-200 p-10">
          <h3 className="text-lg font-bold text-slate-900">Kuch ghalat ho gaya</h3>
          <p className="text-sm text-slate-500 mt-2">براہ کرم upload page par wapas jayein aur dataset dobara load karein.</p>
          <button
            type="button"
            onClick={() => { this.setState({ hasError: false }); this.props.onReset?.(); }}
            className="mt-5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
