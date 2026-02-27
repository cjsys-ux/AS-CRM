import { useAuth0 } from '../context/Auth0Context';
import { LoadingPage } from './LoadingPage';

export function CallbackPage() {
  const { isLoading, error } = useAuth0();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600">Authentication Error</h1>
          <p className="text-slate-600 text-center">{error.message}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return <LoadingPage />;
}
