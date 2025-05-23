import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-indigo-50 to-white">
            {/* Left side - Branding Panel */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-12 flex-col justify-between">
                <div className="mb-8">
                    <Link href="/">
                        <ApplicationLogo className="h-12 inline-block" />
                    </Link>
                </div>
                
                <div className="space-y-6">
                    <h1 className="text-4xl font-bold tracking-tight">Manage your multi-store inventory with ease</h1>
                    <p className="text-indigo-100 text-lg">
                        Connect your Shopify, Etsy, and Amazon stores to track inventory, receive alerts, and grow your business.
                    </p>
                    
                    <div className="pt-8 space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-500 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p>Sync inventory across multiple platforms</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-500 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p>Get notified when stock is low</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-500 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p>Track performance across all stores</p>
                        </div>
                    </div>
                </div>
                
                <div className="pt-12 text-sm text-indigo-200">
                    © {new Date().getFullYear()} Texporta. All rights reserved.
                </div>
            </div>
            
            {/* Right side - Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="md:hidden mb-8">
                        <Link href="/">
                            <ApplicationLogo className="h-10 mx-auto inline-block" />
                        </Link>
                    </div>
                    
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
