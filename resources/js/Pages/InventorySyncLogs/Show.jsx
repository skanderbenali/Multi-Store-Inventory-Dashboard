import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ auth, syncLog }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };

    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'shopify': return '🛍️';
            case 'etsy': return '🧶';
            case 'amazon': return '📦';
            default: return '🏪';
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'in_progress':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const formatJSON = (jsonObject) => {
        if (!jsonObject) return 'No data';
        
        try {
            const obj = typeof jsonObject === 'string' ? JSON.parse(jsonObject) : jsonObject;
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            return String(jsonObject);
        }
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Sync Log Details</h2>}
        >
            <Head title="Sync Log Details" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Navigation */}
                    <div className="flex justify-between mb-6">
                        <Link 
                            href={route('inventory-sync-logs.index')} 
                            className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                            </svg>
                            Back to Sync Logs
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Sync Information */}
                        <div className="lg:col-span-1">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sync Information</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Sync ID</span>
                                            <p className="mt-1 text-gray-900 font-mono">{syncLog.id}</p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Status</span>
                                            <p className="mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(syncLog.status)}`}>
                                                    {syncLog.status}
                                                </span>
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Type</span>
                                            <p className="mt-1 text-gray-900 capitalize">{syncLog.sync_type || 'N/A'}</p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Started At</span>
                                            <p className="mt-1 text-gray-900">{formatDate(syncLog.created_at)}</p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Completed At</span>
                                            <p className="mt-1 text-gray-900">{formatDate(syncLog.completed_at)}</p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Products Synced</span>
                                            <p className="mt-1 text-gray-900">{syncLog.products_synced || 0}</p>
                                        </div>
                                        
                                        {syncLog.is_bulk && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Sync Type</span>
                                                <p className="mt-1 text-gray-900">Bulk Synchronization</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Store Information */}
                            {syncLog.storeIntegration && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Store Information</h3>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-2">{getPlatformIcon(syncLog.storeIntegration.platform)}</span>
                                                <span className="text-lg font-medium">{syncLog.storeIntegration.name}</span>
                                            </div>
                                            
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Platform</span>
                                                <p className="mt-1 text-gray-900 capitalize">{syncLog.storeIntegration.platform}</p>
                                            </div>
                                            
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Store URL</span>
                                                <p className="mt-1 text-gray-900">{syncLog.storeIntegration.shop_url || 'N/A'}</p>
                                            </div>
                                            
                                            <div className="pt-2">
                                                <Link 
                                                    href={route('store-integrations.show', syncLog.storeIntegration.id)} 
                                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                >
                                                    View Store Details →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Product Information */}
                            {syncLog.product && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
                                        
                                        <div className="flex items-center mb-4">
                                            {syncLog.product.image_url ? (
                                                <div className="flex-shrink-0 h-16 w-16">
                                                    <img 
                                                        className="h-16 w-16 rounded-md object-cover" 
                                                        src={syncLog.product.image_url} 
                                                        alt={syncLog.product.title} 
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="ml-4">
                                                <h4 className="text-lg font-medium text-gray-900">{syncLog.product.title}</h4>
                                                <p className="text-sm text-gray-500">SKU: {syncLog.product.sku || 'N/A'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Current Stock</span>
                                                <p className="mt-1 text-gray-900">{syncLog.product.quantity}</p>
                                            </div>
                                            
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                                                <p className="mt-1 text-gray-900">{formatDate(syncLog.product.updated_at)}</p>
                                            </div>
                                            
                                            <div className="pt-2">
                                                <Link 
                                                    href={route('products.show', syncLog.product.id)} 
                                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                >
                                                    View Product Details →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Right Column - Sync Details & Changes */}
                        <div className="lg:col-span-2">
                            {/* Sync Message & Error Details */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Sync Details</h3>
                                    
                                    {syncLog.message && (
                                        <div className={`p-4 mb-4 rounded-md ${
                                            syncLog.status?.toLowerCase() === 'failed' 
                                                ? 'bg-red-50 border border-red-200' 
                                                : 'bg-gray-50 border border-gray-200'
                                        }`}>
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    {syncLog.status?.toLowerCase() === 'failed' ? (
                                                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className={`text-sm font-medium ${
                                                        syncLog.status?.toLowerCase() === 'failed' 
                                                            ? 'text-red-800' 
                                                            : 'text-gray-800'
                                                    }`}>
                                                        {syncLog.status?.toLowerCase() === 'failed' ? 'Error Message' : 'Message'}
                                                    </h3>
                                                    <div className={`mt-2 text-sm ${
                                                        syncLog.status?.toLowerCase() === 'failed' 
                                                            ? 'text-red-700' 
                                                            : 'text-gray-700'
                                                    }`}>
                                                        <p>{syncLog.message}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Error Details */}
                                    {syncLog.error_details && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Error Details</h4>
                                            <pre className="p-4 bg-gray-100 rounded-md overflow-x-auto text-xs font-mono">
                                                {formatJSON(syncLog.error_details)}
                                            </pre>
                                        </div>
                                    )}
                                    
                                    {/* Request Details */}
                                    {syncLog.request_data && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Request Data</h4>
                                            <pre className="p-4 bg-gray-100 rounded-md overflow-x-auto text-xs font-mono">
                                                {formatJSON(syncLog.request_data)}
                                            </pre>
                                        </div>
                                    )}
                                    
                                    {/* Response Details */}
                                    {syncLog.response_data && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Response Data</h4>
                                            <pre className="p-4 bg-gray-100 rounded-md overflow-x-auto text-xs font-mono">
                                                {formatJSON(syncLog.response_data)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Changes Made */}
                            {syncLog.changes && Object.keys(syncLog.changes).length > 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Changes Made</h3>
                                        
                                        <div className="overflow-hidden border border-gray-300 rounded-md">
                                            <table className="min-w-full divide-y divide-gray-300">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Field
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Previous Value
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            New Value
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {Object.entries(syncLog.changes).map(([field, values]) => (
                                                        <tr key={field}>
                                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 bg-gray-50 whitespace-nowrap">
                                                                {field}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-pre-wrap break-all">
                                                                {values.old !== undefined 
                                                                    ? typeof values.old === 'object' 
                                                                        ? JSON.stringify(values.old) 
                                                                        : String(values.old)
                                                                    : 'N/A'}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-pre-wrap break-all">
                                                                {values.new !== undefined 
                                                                    ? typeof values.new === 'object' 
                                                                        ? JSON.stringify(values.new) 
                                                                        : String(values.new)
                                                                    : 'N/A'}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
