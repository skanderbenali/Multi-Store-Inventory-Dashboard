import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function Show({ auth, storeIntegration, lastSync, flash, can }) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(!!flash?.success);
    const [syncInProgress, setSyncInProgress] = useState(false);
    
    // Platform-specific styling
    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'shopify': return '🛍️';
            case 'etsy': return '🧶';
            case 'amazon': return '📦';
            default: return '🏪';
        }
    };
    
    const getPlatformColor = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'shopify': return 'bg-green-100 text-green-800 border-green-300';
            case 'etsy': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'amazon': return 'bg-blue-100 text-blue-800 border-blue-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };
    
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString();
    };
    
    // Handle manual sync
    const handleSync = () => {
        setSyncInProgress(true);
        router.post(route('store-integrations.sync', storeIntegration.id), {}, {
            onFinish: () => setTimeout(() => setSyncInProgress(false), 1000),
        });
    };
    
    // Handle delete
    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this store integration? This will also remove all linked products and sync logs.')) {
            router.delete(route('store-integrations.destroy', storeIntegration.id));
        }
    };
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={
                <div className="flex items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight mr-2">
                        {storeIntegration.name}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlatformColor(storeIntegration.platform)}`}>
                        {storeIntegration.platform}
                    </span>
                </div>
            }
        >
            <Head title={storeIntegration.name} />
            
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
                    
                    {/* Action buttons */}
                    <div className="flex justify-between mb-6">
                        <Link 
                            href={route('store-integrations.index')} 
                            className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                            </svg>
                            Back to Integrations
                        </Link>
                        
                        <div className="flex space-x-3">
                            {can.edit_integration && (
                                <Link
                                    href={route('store-integrations.edit', storeIntegration.id)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md shadow-sm flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit Integration
                                </Link>
                            )}
                            
                            {can.sync_products && (
                                <button
                                    onClick={handleSync}
                                    disabled={syncInProgress}
                                    className={`${
                                        syncInProgress ? "bg-green-500" : "bg-green-600 hover:bg-green-700"
                                    } text-white py-2 px-4 rounded-md shadow-sm flex items-center`}
                                >
                                    {syncInProgress ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                            </svg>
                                            Sync Now
                                        </>
                                    )}
                                </button>
                            )}
                            
                            {can.delete_integration && (
                                <button
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md shadow-sm flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                    Delete
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Main content - two column layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            {/* Store Integration Details */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Integration Details</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Platform</span>
                                            <div className="mt-1 flex items-center">
                                                <span className="text-2xl mr-2">{getPlatformIcon(storeIntegration.platform)}</span>
                                                <span className="text-lg">{storeIntegration.platform}</span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Store URL / ID</span>
                                            <p className="mt-1 text-gray-900">{storeIntegration.shop_url || 'Not set'}</p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Status</span>
                                            <p className="mt-1">
                                                {storeIntegration.is_active ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        Inactive
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">API Key</span>
                                            <p className="mt-1 text-gray-900">
                                                {storeIntegration.api_key ? '••••••••' + storeIntegration.api_key.substr(-4) : 'Not set'}
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Created</span>
                                            <p className="mt-1 text-gray-900">{formatDate(storeIntegration.created_at)}</p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Last Updated</span>
                                            <p className="mt-1 text-gray-900">{formatDate(storeIntegration.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Last Sync Status */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Last Sync</h3>
                                    
                                    {lastSync ? (
                                        <div className="space-y-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Status</span>
                                                <p className="mt-1">
                                                    {(() => {
                                                        switch (lastSync.status) {
                                                            case 'completed':
                                                                return (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                        Completed
                                                                    </span>
                                                                );
                                                            case 'failed':
                                                                return (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                        Failed
                                                                    </span>
                                                                );
                                                            case 'in_progress':
                                                                return (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                        In Progress
                                                                    </span>
                                                                );
                                                            default:
                                                                return (
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                        Pending
                                                                    </span>
                                                                );
                                                        }
                                                    })()}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">When</span>
                                                <p className="mt-1 text-gray-900">{formatDate(lastSync.created_at)}</p>
                                            </div>
                                            
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Type</span>
                                                <p className="mt-1 capitalize text-gray-900">{lastSync.sync_type}</p>
                                            </div>
                                            
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Products Synced</span>
                                                <p className="mt-1 text-gray-900">{lastSync.products_synced}</p>
                                            </div>
                                            
                                            {lastSync.message && (
                                                <div>
                                                    <span className="text-sm font-medium text-gray-500">Message</span>
                                                    <p className="mt-1 text-gray-900">{lastSync.message}</p>
                                                </div>
                                            )}
                                            
                                            <div className="pt-4">
                                                <Link 
                                                    href={route('inventory-sync-logs.show', lastSync.id)} 
                                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                >
                                                    View Sync Details →
                                                </Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-500 text-center p-4">
                                            <p>No sync has been performed yet.</p>
                                            {can.sync_products && (
                                                <button
                                                    onClick={handleSync}
                                                    className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                >
                                                    Sync Now
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="lg:col-span-2">
                            {/* Recent Products */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Products</h3>
                                        <Link 
                                            href={route('products.index', { filter: { integration: storeIntegration.id } })} 
                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                        >
                                            View All Products
                                        </Link>
                                    </div>
                                    
                                    {storeIntegration.products && storeIntegration.products.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Product
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            SKU
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Stock
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Last Sync
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {storeIntegration.products.map((product) => (
                                                        <tr key={product.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-500">{product.sku}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {product.quantity <= 0 ? (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                                        Out of stock
                                                                    </span>
                                                                ) : product.quantity <= product.low_stock_threshold ? (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                                        Low stock ({product.quantity})
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                                        In stock ({product.quantity})
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(product.last_sync_at)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                <Link href={route('products.show', product.id)} className="text-indigo-600 hover:text-indigo-900">
                                                                    View
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8 4l-8 4m8-4l-8-4m8 4l-8 4m8-4v4m-16-4l8 4"></path>
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Get started by syncing products from your store.
                                            </p>
                                            {can.sync_products && (
                                                <div className="mt-6">
                                                    <button
                                                        onClick={handleSync}
                                                        type="button"
                                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                                    >
                                                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                                        </svg>
                                                        Sync Products
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
