import React from 'react';
import { Link } from '@inertiajs/react';

export default function StorePlatformCard({ integration }) {
    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'shopify': return '🛍️';
            case 'etsy': return '🧶';
            case 'amazon': return '📦';
            default: return '🏪';
        }
    };
    
    const getPlatformClass = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'shopify':
                return 'border-green-200 bg-green-50';
            case 'etsy':
                return 'border-orange-200 bg-orange-50';
            case 'amazon':
                return 'border-blue-200 bg-blue-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };
    
    const getStatusColor = (isActive) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Link
            href={route('store-integrations.show', integration.id)}
            className={`block border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md ${getPlatformClass(integration.platform)}`}
        >
            <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-2xl">{getPlatformIcon(integration.platform)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.is_active)}`}>
                        {integration.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-1">{integration.name}</h4>
                <p className="text-sm text-gray-600 mb-3 truncate">{integration.shop_url || 'No URL'}</p>
                
                <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                    <span>Products: {integration.products_count || 0}</span>
                    <span>Last Sync: {formatDate(integration.last_sync_at)}</span>
                </div>
            </div>
        </Link>
    );
}
