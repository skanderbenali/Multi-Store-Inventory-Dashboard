import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function Index({ auth, integrations, flash, can }) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(!!flash?.success);
    
    // Platform icons and colors
    const getPlatformIcon = (platform) => {
        switch (platform.toLowerCase()) {
            case 'shopify': return '🛍️';
            case 'etsy': return '🧶';
            case 'amazon': return '📦';
            default: return '🏪';
        }
    };
    
    const getPlatformColor = (platform) => {
        switch (platform.toLowerCase()) {
            case 'shopify': return 'bg-green-100 text-green-800';
            case 'etsy': return 'bg-orange-100 text-orange-800';
            case 'amazon': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    
    // Function to handle manual sync
    const handleSync = (integrationId) => {
        router.post(`/store-integrations/${integrationId}/sync`);
    };
    
    // Function to delete integration
    const handleDelete = (integrationId) => {
        if (confirm('Are you sure you want to delete this store integration? This will also remove all linked products and sync logs.')) {
            router.delete(`/store-integrations/${integrationId}`);
        }
    };
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Store Integrations</h2>}
        >
            <Head title="Store Integrations" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Success Message */}
                    <Transition
                        show={showSuccessMessage}
                        enter="transition ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800">{flash?.success}</p>
                                </div>
                                <div className="ml-auto pl-3">
                                    <div className="-mx-1.5 -my-1.5">
                                        <button 
                                            type="button" 
                                            className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                                            onClick={() => setShowSuccessMessage(false)}
                                        >
                                            <span className="sr-only">Dismiss</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Transition>
                    
                    {/* Header with Add Integration Button */}
                    <div className="flex justify-between mb-6">
                        <h1 className="text-2xl font-semibold text-gray-800">Your Store Integrations</h1>
                        {can.create_integration && (
                            <Link 
                                href="/store-integrations/create" 
                                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm"
                            >
                                Add New Integration
                            </Link>
                        )}
                    </div>
                    
                    {/* Store Integrations List */}
                    {integrations.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-10 text-center">
                                <h3 className="text-xl font-medium text-gray-600 mb-4">No store integrations yet</h3>
                                <p className="text-gray-500 mb-6">Get started by adding your first e-commerce platform integration.</p>
                                {can.create_integration && (
                                    <Link 
                                        href="/store-integrations/create" 
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md shadow-sm inline-flex items-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Connect Your First Store
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {integrations.map((integration) => (
                                <div key={integration.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-semibold">{integration.name}</h2>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlatformColor(integration.platform)}`}>
                                                {getPlatformIcon(integration.platform)} {integration.platform.charAt(0).toUpperCase() + integration.platform.slice(1)}
                                            </span>
                                        </div>
                                        
                                        <div className="border-t border-gray-200 py-3">
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Shop URL:</span> {integration.shop_url || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Status:</span> {integration.is_active ? (
                                                        <span className="text-green-600">Active</span>
                                                    ) : (
                                                        <span className="text-red-600">Inactive</span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Last Sync:</span> {integration.last_sync_at ? (
                                                        new Date(integration.last_sync_at).toLocaleString()
                                                    ) : 'Never'}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="border-t border-gray-200 pt-4 mt-4 flex flex-wrap gap-2">
                                            <Link 
                                                href={`/store-integrations/${integration.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                            >
                                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                                </svg>
                                                View
                                            </Link>
                                            
                                            {can.edit_integration && (
                                                <Link 
                                                    href={`/store-integrations/${integration.id}/edit`}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                            )}
                                            
                                            {can.sync_products && (
                                                <button 
                                                    onClick={() => handleSync(integration.id)}
                                                    className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                    </svg>
                                                    Sync
                                                </button>
                                            )}
                                            
                                            {can.delete_integration && (
                                                <button 
                                                    onClick={() => handleDelete(integration.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
