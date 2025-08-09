import Link from 'next/link';
import { Users, FileText, BarChart3 } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="absolute top-0 right-0 p-8 flex gap-4">
                <Link
                    href="/login"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    Sign In
                </Link>
                <Link
                    href="/register"
                    className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                    Sign Up
                </Link>
            </div>

            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                        Mini <span className="text-blue-600">CRM</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                        A simple CRM system for freelancers and small teams. Track clients, manage invoices,
                        and grow your workflow — all in one place.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-white shadow-lg rounded-xl p-8 hover:shadow-xl transition-shadow">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Users className="h-8 w-8 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-xl mb-3 text-gray-900">Client Management</h3>
                            <p className="text-gray-600">Keep track of all your clients with detailed profiles and contact information.</p>
                        </div>
                        
                        <div className="bg-white shadow-lg rounded-xl p-8 hover:shadow-xl transition-shadow">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <FileText className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-xl mb-3 text-gray-900">Invoice Tracking</h3>
                            <p className="text-gray-600">Create and manage invoices, track payments, and never miss a deadline.</p>
                        </div>
                        
                        <div className="bg-white shadow-lg rounded-xl p-8 hover:shadow-xl transition-shadow">
                            <div className="flex justify-center mb-4">
                                <div className="p-3 bg-purple-50 rounded-lg">
                                    <BarChart3 className="h-8 w-8 text-purple-600" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-xl mb-3 text-gray-900">Dashboard Analytics</h3>
                            <p className="text-gray-600">Get insights into your business with comprehensive metrics and reports.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Link
                            href="/register"
                            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                        >
                            Get Started Today
                        </Link>
                        <div className="text-sm text-gray-500">
                            Free to use • No credit card required
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
