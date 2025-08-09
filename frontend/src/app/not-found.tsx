import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200">404</h1>
          <div className="relative -mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. 
              It might have been moved, deleted, or you entered the wrong URL.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          
          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact support or check our{' '}
            <Link href="/" className="text-blue-600 hover:text-blue-500 transition-colors">
              documentation
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
