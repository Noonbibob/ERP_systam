import * as React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    (this as any).state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    const state = (this as any).state as State;
    const props = (this as any).props as Props;

    if (state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirebaseConfigError = false;

      try {
        const parsedError = JSON.parse(state.error?.message || '{}');
        if (parsedError.error && (parsedError.error.includes('auth/api-key-not-valid') || parsedError.error.includes('the client is offline'))) {
          isFirebaseConfigError = true;
          errorMessage = "Firebase Configuration Error: The API key or database ID is invalid.";
        } else if (parsedError.error) {
          errorMessage = parsedError.error;
        }
      } catch (e) {
        if (state.error?.message.includes('auth/api-key-not-valid')) {
          isFirebaseConfigError = true;
          errorMessage = "Firebase Configuration Error: Invalid API Key.";
        } else {
          errorMessage = state.error?.message || errorMessage;
        }
      }

      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">System Error</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{errorMessage}</p>
            </div>
            
            {isFirebaseConfigError && (
              <div className="bg-zinc-800/50 p-4 rounded-xl text-left space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#F27D26]">Troubleshooting</p>
                <ul className="text-xs text-zinc-500 space-y-2 list-disc pl-4">
                  <li>Ensure you have accepted Firebase terms in the AI Studio UI.</li>
                  <li>Check if <code className="text-zinc-300">firebase-applet-config.json</code> has valid keys.</li>
                  <li>Try refreshing the page or restarting the dev server.</li>
                </ul>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-all active:scale-95"
            >
              <RefreshCw size={18} />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
