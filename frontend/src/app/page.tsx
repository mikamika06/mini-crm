export default function HomePage() {
    return (
        <div className="max-w-3xl mx-auto py-20 relative">
            {/* Top right Login/Register buttons */}
            <div className="absolute top-8 right-8 flex gap-4">
                <a
                    href="/login"
                    className="bg-black text-white px-5 py-2 rounded-md hover:bg-black/90"
                >
                    Login
                </a>
                <a
                    href="/register"
                    className="border border-black text-black px-5 py-2 rounded-md hover:bg-black/5"
                >
                    Register
                </a>
            </div>

            {/* Main content moved lower */}
            <div className="text-center mt-32">
                <h1 className="text-4xl font-bold mb-6 text-brand">Mini CRM</h1>
                <p className="text-gray-600 text-lg mb-10">
                    A simple CRM system for freelancers and small teams. Track clients, manage invoices,
                    and grow your workflow — all in one place.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-2">✅ Simple</h3>
                        <p className="text-sm text-gray-500">No clutter. Clean and focused.</p>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-2">🔐 Secure</h3>
                        <p className="text-sm text-gray-500">Login protected. JWT-auth backed.</p>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-2">⚡ Fast</h3>
                        <p className="text-sm text-gray-500">Built with Next.js and Tailwind.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}