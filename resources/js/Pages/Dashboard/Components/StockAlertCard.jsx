import React from 'react';
import { Link } from '@inertiajs/react';

export default function StockAlertCard({ alert }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };
    
    const getAlertStatusClass = () => {
        if (!alert.is_active) {
            return 'bg-gray-100 text-gray-800';
        }
        
        if (alert.triggered_at) {
            return 'bg-red-100 text-red-800';
        }
        
        return 'bg-yellow-100 text-yellow-800';
    };
    
    const getAlertStatusText = () => {
        if (!alert.is_active) {
            return 'Inactive';
        }
        
        if (alert.triggered_at) {
            return 'Triggered';
        }
        
        return 'Active';
    };
    
    const getStockLevelClass = () => {
        const product = alert.product;
        
        if (product.quantity <= 0) {
            return 'text-red-600';
        }
        
        if (product.quantity <= alert.threshold) {
            return 'text-yellow-600';
        }
        
        return 'text-green-600';
    };

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <Link
                            href={route('products.show', alert.product.id)}
                            className="font-medium text-gray-900 hover:text-indigo-600"
                        >
                            {alert.product.title}
                        </Link>
                        <p className="text-sm text-gray-500 mt-0.5">
                            SKU: {alert.product.sku || 'N/A'}
                        </p>
                    </div>
                    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${getAlertStatusClass()}`}>
                        {getAlertStatusText()}
                    </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex flex-col">
                        <span className="text-gray-500">Threshold</span>
                        <span className="font-semibold">{alert.threshold} units</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-500">Current Stock</span>
                        <span className={`font-semibold ${getStockLevelClass()}`}>
                            {alert.product.quantity} units
                        </span>
                    </div>
                </div>
                
                {alert.triggered_at && (
                    <div className="text-xs text-gray-500 mt-1">
                        Triggered: {formatDate(alert.triggered_at)}
                    </div>
                )}
                
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between">
                    <Link
                        href={route('products.show', alert.product.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                        View Product
                    </Link>
                    <Link
                        href={route('stock-alerts.edit', alert.id)}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                        Manage Alert
                    </Link>
                </div>
            </div>
        </div>
    );
}
