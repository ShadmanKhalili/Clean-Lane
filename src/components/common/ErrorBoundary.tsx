import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { clearPersistedState } from '../../hooks/usePersistentState';

interface Props {
  children: React.ReactNode;
  lang?: 'en' | 'bn';
}

interface State {
  error: Error | null;
}

/**
 * Contains a crash to the current workspace instead of blanking the whole app.
 * Also offers a data reset, since a corrupted persisted snapshot is the most
 * likely cause of a render error that survives a reload.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Clean Lane] view crashed', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    const en = this.props.lang !== 'bn';

    return (
      <div role="alert" className="max-w-lg mx-auto my-16 p-6 bg-white border border-[#EDE4D8] rounded-3xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-[#FDF0E1] flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-[#B46A14]" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-[#172521]">
          {en ? 'This screen ran into a problem' : 'এই স্ক্রিনে একটি সমস্যা হয়েছে'}
        </h2>
        <p className="text-sm text-[#53616D]">
          {en
            ? 'Your other data is safe. Try again, or reset the demo data if the problem persists.'
            : 'আপনার অন্যান্য তথ্য নিরাপদ। আবার চেষ্টা করুন অথবা ডেমো ডেটা রিসেট করুন।'}
        </p>
        <pre className="text-[11px] text-left bg-[#FAF5EC] rounded-xl p-3 overflow-auto max-h-32 text-[#7A3B0F]">{error.message}</pre>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => this.setState({ error: null })}
            className="px-4 py-2 rounded-xl bg-[#124B3A] text-white text-sm font-bold cursor-pointer"
          >
            {en ? 'Try again' : 'আবার চেষ্টা করুন'}
          </button>
          <button
            onClick={() => {
              clearPersistedState();
              window.location.reload();
            }}
            className="px-4 py-2 rounded-xl border border-[#EDE4D8] text-sm font-bold text-[#202B38] cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            {en ? 'Reset demo data' : 'ডেমো ডেটা রিসেট'}
          </button>
        </div>
      </div>
    );
  }
}
