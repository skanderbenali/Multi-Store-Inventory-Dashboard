import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Edit({ auth, product, stores, can }) {
    const { data, setData, patch, processing, errors, reset } = useForm({
        title: product.title || '',
        sku: product.sku || '',
        description: product.description || '',
        quantity: product.quantity || 0,
        low_stock_threshold: product.low_stock_threshold || 5,
        reorder_point: product.reorder_point || null,
        price: product.price || null,
        cost: product.cost || null,
        compare_at_price: product.compare_at_price || null,
        currency: product.currency || 'USD',
        image_url: product.image_url || '',
        product_url: product.product_url || '',
        store_integration_id: product.store_integration_id || '',
        is_managed: product.is_managed === undefined ? true : product.is_managed,
    });
    
    const [confirmingInventoryReset, setConfirmingInventoryReset] = useState(false);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('products.update', product.id));
    };
    
    // Handle currency select
    const currencies = [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'CAD', name: 'Canadian Dollar' },
        { code: 'AUD', name: 'Australian Dollar' },
        { code: 'JPY', name: 'Japanese Yen' }
    ];
    
    // Function to format number inputs for price display
    const formatPrice = (value) => {
        if (value === null || value === '') return '';
        return value.toString();
    };
    
    // Function to parse number inputs for price
    const parsePrice = (value) => {
        if (value === '' || value === null) return null;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
    };
    
    // Handle inventory reset confirmation
    const confirmInventoryReset = () => {
        setConfirmingInventoryReset(true);
    };
    
    // Reset inventory
    const resetInventory = () => {
        setData('quantity', 0);
        setConfirmingInventoryReset(false);
    };
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Product</h2>}
        >
            <Head title="Edit Product" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column */}
                            <div className="col-span-1">
                                {/* Navigation and Actions */}
                                <div className="mb-6">
                                    <Link
                                        href={route('products.show', product.id)}
                                        className="text-gray-600 hover:text-gray-900 flex items-center"
                                    >
                                        <svg className="w-5 h-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                            <path d="M11 17l-5-5m0 0l5-5m-5 5h12"></path>
                                        </svg>
                                        Back to Product
                                    </Link>
                                </div>
                                
                                {/* Image */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Image</h3>
                                        
                                        <div className="mb-4">
                                            {data.image_url ? (
                                                <img 
                                                    src={data.image_url} 
                                                    alt={data.title} 
                                                    className="w-full h-48 object-contain rounded-md mb-4"
                                                />
                                            ) : (
                                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md mb-4">
                                                    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                            
                                            <InputLabel htmlFor="image_url" value="Image URL" />
                                            <TextInput
                                                id="image_url"
                                                type="url"
                                                name="image_url"
                                                value={data.image_url}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('image_url', e.target.value)}
                                            />
                                            <InputError message={errors.image_url} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Store Information */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Store Information</h3>
                                        
                                        <div className="mb-4">
                                            <InputLabel htmlFor="store_integration_id" value="Store" />
                                            <select
                                                id="store_integration_id"
                                                name="store_integration_id"
                                                value={data.store_integration_id}
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                onChange={(e) => setData('store_integration_id', e.target.value)}
                                                disabled={product.external_id} // Disable if product is from an external store
                                            >
                                                <option value="">Select a store</option>
                                                {stores.map((store) => (
                                                    <option key={store.id} value={store.id}>
                                                        {store.name} ({store.platform})
                                                    </option>
                                                ))}
                                            </select>
                                            {product.external_id && (
                                                <p className="mt-1 text-xs text-gray-500">
                                                    This product is linked to an external store and cannot be moved.
                                                </p>
                                            )}
                                            <InputError message={errors.store_integration_id} className="mt-2" />
                                        </div>
                                        
                                        <div className="mb-4">
                                            <InputLabel htmlFor="product_url" value="Product URL" />
                                            <TextInput
                                                id="product_url"
                                                type="url"
                                                name="product_url"
                                                value={data.product_url}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('product_url', e.target.value)}
                                            />
                                            <InputError message={errors.product_url} className="mt-2" />
                                        </div>
                                        
                                        <div className="mb-4">
                                            <label className="flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    name="is_managed"
                                                    checked={data.is_managed}
                                                    onChange={(e) => setData('is_managed', e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Manage inventory</span>
                                            </label>
                                            <p className="mt-1 text-xs text-gray-500">
                                                When enabled, inventory changes will be synced to the external store.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Main Content */}
                            <div className="lg:col-span-2">
                                {/* Product Details */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                                        
                                        <div className="mb-4">
                                            <InputLabel htmlFor="title" value="Title" />
                                            <TextInput
                                                id="title"
                                                type="text"
                                                name="title"
                                                value={data.title}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('title', e.target.value)}
                                                required
                                            />
                                            <InputError message={errors.title} className="mt-2" />
                                        </div>
                                        
                                        <div className="mb-4">
                                            <InputLabel htmlFor="sku" value="SKU" />
                                            <TextInput
                                                id="sku"
                                                type="text"
                                                name="sku"
                                                value={data.sku}
                                                className="mt-1 block w-full"
                                                onChange={(e) => setData('sku', e.target.value)}
                                            />
                                            <InputError message={errors.sku} className="mt-2" />
                                        </div>
                                        
                                        <div className="mb-4">
                                            <InputLabel htmlFor="description" value="Description" />
                                            <textarea
                                                id="description"
                                                name="description"
                                                value={data.description || ''}
                                                rows="5"
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                onChange={(e) => setData('description', e.target.value)}
                                            ></textarea>
                                            <InputError message={errors.description} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Inventory Information */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">Inventory</h3>
                                            <button
                                                type="button"
                                                onClick={confirmInventoryReset}
                                                className="text-sm text-red-600 hover:text-red-800"
                                            >
                                                Reset Inventory
                                            </button>
                                        </div>
                                        
                                        {confirmingInventoryReset && (
                                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm text-red-800">
                                                            Are you sure you want to reset inventory to zero? This action cannot be undone.
                                                        </p>
                                                        <div className="mt-2 flex space-x-3">
                                                            <button
                                                                type="button"
                                                                className="text-sm text-red-600 font-medium"
                                                                onClick={resetInventory}
                                                            >
                                                                Yes, reset to zero
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="text-sm text-gray-600 font-medium"
                                                                onClick={() => setConfirmingInventoryReset(false)}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="col-span-1">
                                                <InputLabel htmlFor="quantity" value="Current Stock" />
                                                <TextInput
                                                    id="quantity"
                                                    type="number"
                                                    name="quantity"
                                                    value={data.quantity}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => setData('quantity', e.target.value)}
                                                    required
                                                    min="0"
                                                />
                                                <InputError message={errors.quantity} className="mt-2" />
                                            </div>
                                            
                                            <div className="col-span-1">
                                                <InputLabel htmlFor="low_stock_threshold" value="Low Stock Threshold" />
                                                <TextInput
                                                    id="low_stock_threshold"
                                                    type="number"
                                                    name="low_stock_threshold"
                                                    value={data.low_stock_threshold}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => setData('low_stock_threshold', e.target.value)}
                                                    required
                                                    min="0"
                                                />
                                                <InputError message={errors.low_stock_threshold} className="mt-2" />
                                            </div>
                                            
                                            <div className="col-span-1">
                                                <InputLabel htmlFor="reorder_point" value="Reorder Point (Optional)" />
                                                <TextInput
                                                    id="reorder_point"
                                                    type="number"
                                                    name="reorder_point"
                                                    value={data.reorder_point === null ? '' : data.reorder_point}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => setData('reorder_point', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                                                    min="0"
                                                />
                                                <InputError message={errors.reorder_point} className="mt-2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Pricing Information */}
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing (Optional)</h3>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="col-span-1">
                                                <InputLabel htmlFor="price" value="Price" />
                                                <TextInput
                                                    id="price"
                                                    type="number"
                                                    name="price"
                                                    value={formatPrice(data.price)}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => setData('price', parsePrice(e.target.value))}
                                                    step="0.01"
                                                    min="0"
                                                />
                                                <InputError message={errors.price} className="mt-2" />
                                            </div>
                                            
                                            <div className="col-span-1">
                                                <InputLabel htmlFor="compare_at_price" value="Compare at Price" />
                                                <TextInput
                                                    id="compare_at_price"
                                                    type="number"
                                                    name="compare_at_price"
                                                    value={formatPrice(data.compare_at_price)}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => setData('compare_at_price', parsePrice(e.target.value))}
                                                    step="0.01"
                                                    min="0"
                                                />
                                                <InputError message={errors.compare_at_price} className="mt-2" />
                                            </div>
                                            
                                            <div className="col-span-1">
                                                <InputLabel htmlFor="cost" value="Cost" />
                                                <TextInput
                                                    id="cost"
                                                    type="number"
                                                    name="cost"
                                                    value={formatPrice(data.cost)}
                                                    className="mt-1 block w-full"
                                                    onChange={(e) => setData('cost', parsePrice(e.target.value))}
                                                    step="0.01"
                                                    min="0"
                                                />
                                                <InputError message={errors.cost} className="mt-2" />
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <InputLabel htmlFor="currency" value="Currency" />
                                            <select
                                                id="currency"
                                                name="currency"
                                                value={data.currency}
                                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                                onChange={(e) => setData('currency', e.target.value)}
                                            >
                                                {currencies.map((currency) => (
                                                    <option key={currency.code} value={currency.code}>
                                                        {currency.code} - {currency.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.currency} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Submit Buttons */}
                                <div className="flex items-center justify-end space-x-4">
                                    <Link
                                        href={route('products.show', product.id)}
                                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
