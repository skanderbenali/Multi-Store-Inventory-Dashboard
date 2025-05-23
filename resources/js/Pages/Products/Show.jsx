import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function Show({ auth, product, flash, can }) {
    // Debug: Log the product object to console
    console.log('Product data:', product);
    console.log('Product JSON:', JSON.stringify(product, null, 2));
    
    // Parse images from JSON string if needed
    const parseImages = () => {
        if (!product.images) return [];
        
        try {
            // Check if it's already an array
            if (Array.isArray(product.images)) return product.images;
            
            // Try to parse from JSON string
            return JSON.parse(product.images);
        } catch (e) {
            console.error('Error parsing images:', e);
            return [];
        }
    };
    
    const productImages = parseImages();
    const mainImage = productImages.length > 0 ? productImages[0] : null;
    
    const [showSuccessMessage, setShowSuccessMessage] = useState(!!flash?.success);
    const [isSyncing, setIsSyncing] = useState(false);
    
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
    
    const getStockLevelClass = () => {
        if (product.quantity <= 0) {
            return 'text-red-600 bg-red-100 border-red-300';
        } else if (product.quantity <= product.low_stock_threshold) {
            return 'text-yellow-600 bg-yellow-100 border-yellow-300';
        } else {
            return 'text-green-600 bg-green-100 border-green-300';
        }
    };
    
    const handleSync = () => {
        setIsSyncing(true);
        router.post(route('products.sync', product.id), {}, {
            onFinish: () => setTimeout(() => setIsSyncing(false), 1000),
        });
    };
    
    const createStockAlert = () => {
        router.post(route('stock-alerts.store'), {
            product_id: product.id,
            threshold: product.quantity > 0 ? product.quantity - 1 : 5, // Default to current quantity minus 1 or 5 if out of stock
            is_active: true,
        });
    };
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Product Details</h2>}
        >
            <Head title={product.title} />
            
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
                    
                    {/* Actions */}
                    <div className="flex justify-between mb-6">
                        <Link 
                            href={route('products.index')} 
                            className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                            </svg>
                            Back to Products
                        </Link>
                        
                        <div className="flex space-x-3">
                            {can.sync_products && (
                                <button
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className={`${
                                        isSyncing ? "bg-green-500" : "bg-green-600 hover:bg-green-700"
                                    } text-white py-2 px-4 rounded-md shadow-sm flex items-center`}
                                >
                                    {isSyncing ? (
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
                            
                            {can.edit_products && (
                                <Link
                                    href={route('products.edit', product.id)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md shadow-sm flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                    Edit Product
                                </Link>
                            )}
                            
                            {can.create_stock_alerts && !product.has_stock_alert && (
                                <button
                                    onClick={createStockAlert}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                    Create Stock Alert
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column */}
                        <div>
                            {/* Product Image */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="p-6">
                                    {mainImage ? (
                                        <img 
                                            src={mainImage} 
                                            alt={product.title} 
                                            className="w-full h-64 object-contain rounded-md"
                                        />
                                    ) : (
                                        <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md">
                                            <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Store Information */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Store Information</h3>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Store</span>
                                            <div className="mt-1 flex items-center">
                                                <span className="text-2xl mr-2">{getPlatformIcon(product.store_integration?.platform)}</span>
                                                <span className="text-gray-900">{product.store_integration?.name || 'Unknown'}</span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Platform</span>
                                            <p className="mt-1 text-gray-900 capitalize">{product.store_integration?.platform || 'Unknown'}</p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Store URL</span>
                                            {product.store_integration?.shop_url ? (
                                                <p className="mt-1">
                                                    <a 
                                                        href={`https://${product.store_integration.shop_url}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        {product.store_integration.shop_url} →
                                                    </a>
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-gray-500">N/A</p>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">SKU</span>
                                            <p className="mt-1 text-gray-900 font-mono text-sm">{product.sku || 'N/A'}</p>
                                        </div>
                                        
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Product URL</span>
                                            {product.store_integration?.shop_url && product.platform_product_id ? (
                                                <p className="mt-1">
                                                    <a 
                                                        href={`https://${product.store_integration.shop_url}/products/${product.platform_product_id}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        View on {product.store_integration?.platform || 'Store'} →
                                                    </a>
                                                </p>
                                            ) : (
                                                <p className="mt-1 text-gray-500">Not available</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Stock Alert */}
                            {product.stock_alert && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Alert</h3>
                                        
                                        <div className="space-y-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Status</span>
                                                <p className="mt-1">
                                                    {product.stock_alert.is_active ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Threshold</span>
                                                <p className="mt-1 text-gray-900">{product.stock_alert.threshold} units</p>
                                            </div>
                                            
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Created</span>
                                                <p className="mt-1 text-gray-900">{formatDate(product.stock_alert.created_at)}</p>
                                            </div>
                                            
                                            <div className="pt-4">
                                                <Link 
                                                    href={route('stock-alerts.edit', product.stock_alert.id)} 
                                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                                >
                                                    Manage Alert →
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Product Information */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="border-b border-gray-200">
                                    <div className="p-6">
                                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
                                        
                                        <div className="flex flex-wrap items-center gap-3 mt-4">
                                            {product.price && (
                                                <div className="flex items-center">
                                                    <span className="text-sm text-gray-600 mr-2">Price:</span>
                                                    <span className="font-medium">${product.price}</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-600 mr-2">Stock:</span>
                                                <span className={`font-medium ${product.quantity <= 0 ? 'text-red-600' : (product.quantity <= product.low_stock_threshold ? 'text-yellow-600' : 'text-green-600')}`}>
                                                    {product.quantity} units
                                                </span>
                                                <span className="text-xs text-gray-500 ml-1">(Threshold: {product.low_stock_threshold})</span>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-600 mr-2">Last Updated:</span>
                                                <span className="font-medium">{formatDate(product.updated_at)}</span>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <span className="text-sm text-gray-600 mr-2">Last Sync:</span>
                                                <span className="font-medium">{formatDate(product.last_sync_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    {/* Inventory Information */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className={`p-4 rounded-md border ${getStockLevelClass()}`}>
                                                <h4 className="text-sm font-medium mb-1">Current Stock</h4>
                                                <p className="text-2xl font-bold">{product.quantity}</p>
                                            </div>
                                            
                                            <div className="p-4 rounded-md border border-gray-300 bg-gray-50">
                                                <h4 className="text-sm font-medium mb-1">Low Stock Threshold</h4>
                                                <p className="text-2xl font-bold">{product.low_stock_threshold}</p>
                                            </div>
                                            
                                            {product.reorder_point !== null && (
                                                <div className="p-4 rounded-md border border-gray-300 bg-gray-50">
                                                    <h4 className="text-sm font-medium mb-1">Reorder Point</h4>
                                                    <p className="text-2xl font-bold">{product.reorder_point}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Price Information (always displayed) */}
                                    {(
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="p-4 rounded-md border border-gray-300 bg-gray-50">
                                                    <h4 className="text-sm font-medium mb-1">Price</h4>
                                                    <p className="text-2xl font-bold">
                                                        {product.price !== null && product.price !== undefined
                                                            ? (typeof product.price === 'number' 
                                                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.price)
                                                                : `$${product.price}`)
                                                            : <span className="text-gray-500 text-lg font-normal italic">Not assigned yet</span>
                                                        }
                                                    </p>
                                                </div>
                                                
                                                <div className="p-4 rounded-md border border-gray-300 bg-gray-50">
                                                    <h4 className="text-sm font-medium mb-1">Compare at Price</h4>
                                                    <p className="text-2xl font-bold">
                                                        {product.compare_at_price !== null && product.compare_at_price !== undefined
                                                            ? (typeof product.compare_at_price === 'number' 
                                                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.compare_at_price)
                                                                : `$${product.compare_at_price}`)
                                                            : <span className="text-gray-500 text-lg font-normal italic">Not assigned yet</span>
                                                        }
                                                    </p>
                                                </div>
                                                
                                                <div className="p-4 rounded-md border border-gray-300 bg-gray-50">
                                                    <h4 className="text-sm font-medium mb-1">Cost</h4>
                                                    <p className="text-2xl font-bold">
                                                        {product.cost !== null && product.cost !== undefined
                                                            ? (typeof product.cost === 'number' 
                                                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.cost)
                                                                : `$${product.cost}`)
                                                            : <span className="text-gray-500 text-lg font-normal italic">Not assigned yet</span>
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Product Description */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
                                        
                                        {product.description && product.description.trim() !== '' ? (
                                            <div className="prose max-w-none">
                                                {product.description}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">No description available.</p>
                                        )}
                                    </div>
                                    
                                    {/* Additional Attributes */}
                                    {product.attributes && Object.keys(product.attributes).length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
                                            
                                            <div className="overflow-hidden border border-gray-300 rounded-md">
                                                <table className="min-w-full divide-y divide-gray-300">
                                                    <tbody className="divide-y divide-gray-200">
                                                        {Object.entries(product.attributes).map(([key, value]) => (
                                                            <tr key={key}>
                                                                <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50 whitespace-nowrap">
                                                                    {key}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                                    {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Sync History */}
                            {product.sync_logs && product.sync_logs.length > 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">Sync History</h3>
                                            <Link 
                                                href={route('inventory-sync-logs.index', { filter: { product: product.id } })} 
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                View All Logs
                                            </Link>
                                        </div>
                                        
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Date
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Type
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Changes
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {product.sync_logs.map((log) => (
                                                        <tr key={log.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {formatDate(log.created_at)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                                {log.sync_type}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {(() => {
                                                                    switch (log.status) {
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
                                                                                    {log.status}
                                                                                </span>
                                                                            );
                                                                    }
                                                                })()}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {log.changes && typeof log.changes === 'object' ? (
                                                                    Object.keys(log.changes).length > 0 ? (
                                                                        <Link 
                                                                            href={route('inventory-sync-logs.show', log.id)} 
                                                                            className="text-indigo-600 hover:text-indigo-900"
                                                                        >
                                                                            View Changes
                                                                        </Link>
                                                                    ) : (
                                                                        "No changes"
                                                                    )
                                                                ) : (
                                                                    "N/A"
                                                                )}
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
