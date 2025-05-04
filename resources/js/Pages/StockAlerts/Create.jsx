import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create({ auth, products, preselectedProduct = null }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: preselectedProduct || '',
        threshold: '',
        is_active: true,
        notification_email: true,
        notification_dashboard: true,
    });
    
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Update selected product when product_id changes
    useEffect(() => {
        if (data.product_id) {
            const product = products.find(p => p.id == data.product_id);
            setSelectedProduct(product);
            
            // Set default threshold if product is selected and threshold is not set
            if (product && !data.threshold) {
                // Default threshold is 70% of current quantity or 5, whichever is lower
                const defaultThreshold = Math.min(Math.floor(product.quantity * 0.7), 5);
                setData('threshold', defaultThreshold > 0 ? defaultThreshold : 1);
            }
        } else {
            setSelectedProduct(null);
        }
    }, [data.product_id, products]);
    
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('stock-alerts.store'), {
            onSuccess: () => {
                reset();
            },
        });
    };
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Stock Alert</h2>}
        >
            <Head title="Create Stock Alert" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between mb-6">
                        <Link 
                            href={route('stock-alerts.index')} 
                            className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                            <svg className="w-5 h-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                            </svg>
                            Back to Stock Alerts
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">New Stock Alert</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Create an alert to be notified when a product's stock falls below a specific threshold.
                                            </p>
                                        </div>
                                        
                                        <div className="mb-6">
                                            <InputLabel htmlFor="product_id" value="Product" />
                                            <select
                                                id="product_id"
                                                name="product_id"
                                                value={data.product_id}
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                onChange={(e) => setData('product_id', e.target.value)}
                                                required
                                            >
                                                <option value="">Select a product</option>
                                                {products.map((product) => (
                                                    <option key={product.id} value={product.id}>
                                                        {product.title} {product.sku ? `(${product.sku})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.product_id} className="mt-2" />
                                        </div>
                                        
                                        <div className="mb-6">
                                            <InputLabel htmlFor="threshold" value="Stock Threshold" />
                                            <TextInput
                                                id="threshold"
                                                type="number"
                                                name="threshold"
                                                value={data.threshold}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('threshold', e.target.value)}
                                                min="1"
                                                required
                                            />
                                            <p className="mt-1 text-sm text-gray-500">
                                                You will be alerted when the product's stock falls below this threshold.
                                            </p>
                                            <InputError message={errors.threshold} className="mt-2" />
                                        </div>
                                        
                                        <div className="mb-6">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Notification Methods</h4>
                                            
                                            <div className="space-y-2">
                                                <label className="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        name="notification_email"
                                                        checked={data.notification_email}
                                                        onChange={(e) => setData('notification_email', e.target.checked)}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-600">Email Notification</span>
                                                </label>
                                                
                                                <label className="flex items-center">
                                                    <input 
                                                        type="checkbox" 
                                                        name="notification_dashboard"
                                                        checked={data.notification_dashboard}
                                                        onChange={(e) => setData('notification_dashboard', e.target.checked)}
                                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-600">Dashboard Notification</span>
                                                </label>
                                            </div>
                                            <InputError message={errors.notification_methods} className="mt-2" />
                                        </div>
                                        
                                        <div className="mb-6">
                                            <label className="flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    name="is_active"
                                                    checked={data.is_active}
                                                    onChange={(e) => setData('is_active', e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Active</span>
                                            </label>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Inactive alerts will not trigger notifications.
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center justify-end mt-8 space-x-4">
                                            <Link
                                                href={route('stock-alerts.index')}
                                                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Cancel
                                            </Link>
                                            <PrimaryButton disabled={processing || !data.product_id || !data.threshold}>
                                                {processing ? 'Creating...' : 'Create Alert'}
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <div className="col-span-1">
                            {/* Selected Product Information */}
                            {selectedProduct ? (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Selected Product</h3>
                                        
                                        <div className="flex items-center mb-4">
                                            {selectedProduct.image_url ? (
                                                <div className="flex-shrink-0 h-16 w-16">
                                                    <img 
                                                        className="h-16 w-16 rounded-md object-cover" 
                                                        src={selectedProduct.image_url} 
                                                        alt={selectedProduct.title} 
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
                                                <h4 className="text-lg font-medium text-gray-900">{selectedProduct.title}</h4>
                                                <p className="text-sm text-gray-500">SKU: {selectedProduct.sku || 'N/A'}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="border-t border-gray-200 pt-4 mt-2">
                                            <dl className="space-y-3">
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-500">Current Stock:</dt>
                                                    <dd className="text-sm font-bold text-gray-900">{selectedProduct.quantity}</dd>
                                                </div>
                                                
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-500">Existing Low Stock Threshold:</dt>
                                                    <dd className="text-sm font-bold text-gray-900">{selectedProduct.low_stock_threshold}</dd>
                                                </div>
                                                
                                                {selectedProduct.store_integration && (
                                                    <div className="flex justify-between">
                                                        <dt className="text-sm font-medium text-gray-500">Store:</dt>
                                                        <dd className="text-sm text-gray-900">{selectedProduct.store_integration.name}</dd>
                                                    </div>
                                                )}
                                                
                                                {data.threshold && (
                                                    <div className="flex justify-between pt-3 border-t border-gray-200">
                                                        <dt className="text-sm font-medium text-gray-500">New Alert Threshold:</dt>
                                                        <dd className="text-sm font-bold text-indigo-600">{data.threshold}</dd>
                                                    </div>
                                                )}
                                            </dl>
                                        </div>
                                        
                                        <div className="mt-6">
                                            <Link 
                                                href={route('products.show', selectedProduct.id)} 
                                                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                            >
                                                View Product Details →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No product selected</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Select a product to set up a stock alert.
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {/* Help Info */}
                            <div className="bg-indigo-50 overflow-hidden shadow-sm sm:rounded-lg mt-6">
                                <div className="p-6">
                                    <h3 className="text-md font-medium text-indigo-900 mb-3">About Stock Alerts</h3>
                                    <div className="text-sm text-indigo-800 space-y-2">
                                        <p>
                                            Stock alerts notify you when a product's inventory falls below a specified threshold.
                                        </p>
                                        <p>
                                            You can receive notifications via email and/or on your dashboard.
                                        </p>
                                        <p>
                                            Alerts can be enabled or disabled at any time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
