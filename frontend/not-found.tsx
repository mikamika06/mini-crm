import Link from 'next/link';
import { Home, Search, AlertCircle } from 'lucide-react';

export default function GlobalNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-50 rounded-full">
                <AlertCircle className="h-16 w-16 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              4<span className="text-red-500">0</span>4
            </h1>
            
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Oops! Page Not Found
            </h2>
            
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              The page you&apos;re looking for doesn&apos;t exist. It might have been moved, 
              deleted, or you entered the wrong URL.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Search className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Lost? Try going back to our{' '}
              <Link href="/" className="text-blue-600 hover:text-blue-500 transition-colors underline">
                homepage
              </Link>{' '}
              or{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500 transition-colors underline">
                sign in
              </Link>{' '}
              to access your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
