import React from 'react';
import { Link } from '@inertiajs/react';

export default function RecentSyncCard({ sync }) {
    
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
    
    const getSyncStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
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
                        {status || 'Unknown'}
                    </span>
                );
        }
    };

    return (
        <div className="border border-gray-200 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
            <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                        {sync.storeIntegration && (
                            <span className="text-lg mr-2">
                                {getPlatformIcon(sync.storeIntegration.platform)}
                            </span>
                        )}
                        <div>
                            <div className="text-sm font-medium text-gray-900">
                                {sync.storeIntegration 
                                    ? sync.storeIntegration.name 
                                    : 'Unknown Store'
                                }
                            </div>
                            <div className="text-xs text-gray-500">
                                {formatDate(sync.created_at)}
                            </div>
                        </div>
                    </div>
                    <div className="ml-2">
                        {getSyncStatusBadge(sync.status)}
                    </div>
                </div>
                
                <div className="flex items-center justify-between text-sm mt-3">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Sync Type</span>
                        <span className="capitalize">{sync.sync_type || 'N/A'}</span>
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Products</span>
                        <span>{sync.products_synced || 0}</span>
                    </div>
                    
                    {sync.product && (
                        <div className="flex flex-col max-w-[40%] overflow-hidden">
                            <span className="text-xs text-gray-500">Product</span>
                            <span className="truncate">{sync.product.title}</span>
                        </div>
                    )}
                </div>
                
                {sync.message && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                            {sync.status?.toLowerCase() === 'failed' ? 'Error:' : 'Message:'}
                        </div>
                        <div className={`text-xs mt-1 ${sync.status?.toLowerCase() === 'failed' ? 'text-red-600' : 'text-gray-600'}`}>
                            {sync.message.length > 100 
                                ? sync.message.substring(0, 100) + '...' 
                                : sync.message
                            }
                        </div>
                    </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-gray-200 text-right">
                    <Link
                        href={route('inventory-sync-logs.show', sync.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                        View Details →
                    </Link>
                </div>
            </div>
        </div>
    );
}
