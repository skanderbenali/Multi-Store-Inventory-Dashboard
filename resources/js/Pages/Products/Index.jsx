import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, products, stores, can, filters, flash }) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(!!flash?.success);
    const [searchParams, setSearchParams] = useState({
        search: filters?.search || '',
        store: filters?.store || '',
        status: filters?.status || '',
        sort: filters?.sort || 'newest',
    });
    const [debouncedSearch, setDebouncedSearch] = useState(searchParams.search);
    
    // Helper function to parse images JSON string
    const parseProductImage = (product) => {
        if (!product.images) return null;
        
        try {
            // Check if it's already an array
            if (Array.isArray(product.images)) {
                return product.images.length > 0 ? product.images[0] : null;
            }
            
            // Try to parse from JSON string
            const imagesArray = JSON.parse(product.images);
            return imagesArray.length > 0 ? imagesArray[0] : null;
        } catch (e) {
            console.error('Error parsing images for product:', product.id, e);
            return null;
        }
    };
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchParams.search);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [searchParams.search]);
    
    // Use a ref to track the last applied filters to prevent infinite loops
    const lastAppliedFilters = React.useRef({
        search: filters?.search || '',
        store: filters?.store || '',
        status: filters?.status || '',
        sort: filters?.sort || 'newest',
    });
    
    useEffect(() => {
        // Only apply filters if they've actually changed from what was last applied
        const currentFilters = {
            search: debouncedSearch,
            store: searchParams.store,
            status: searchParams.status,
            sort: searchParams.sort
        };
        
        const lastFilters = lastAppliedFilters.current;
        
        // Check if any filter has changed from what was last applied
        const hasChanged = 
            currentFilters.search !== lastFilters.search ||
            currentFilters.store !== lastFilters.store ||
            currentFilters.status !== lastFilters.status ||
            currentFilters.sort !== lastFilters.sort;
            
        // Check if any filter is different from what's in the URL
        const isDifferentFromUrl = 
            currentFilters.search !== filters?.search ||
            currentFilters.store !== filters?.store ||
            currentFilters.status !== filters?.status ||
            currentFilters.sort !== filters?.sort;
        
        if (hasChanged && isDifferentFromUrl) {
            // Update the ref before applying filters
            lastAppliedFilters.current = {...currentFilters};
            applyFilters();
        }
    }, [debouncedSearch, searchParams.store, searchParams.status, searchParams.sort, filters]);
    
    const applyFilters = () => {
        const params = new URLSearchParams();
        
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (searchParams.store) params.append('store', searchParams.store);
        if (searchParams.status) params.append('status', searchParams.status);
        if (searchParams.sort) params.append('sort', searchParams.sort);
        
        router.get(`/products?${params.toString()}`, {}, { preserveState: true });
    };
    
    const getStockStatus = (product) => {
        if (product.quantity === null || product.quantity === undefined) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Unknown
                </span>
            );
        } else if (product.quantity <= 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Out of Stock
                </span>
            );
        } else if (product.quantity <= product.low_stock_threshold) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Low Stock ({product.quantity})
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    In Stock ({product.quantity})
                </span>
            );
        }
    };
    
    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'shopify': return '🛍️';
            case 'etsy': return '🧶';
            case 'amazon': return '📦';
            default: return '🏪';
        }
    };
    
    const resetFilters = () => {
        setSearchParams({
            search: '',
            store: '',
            status: '',
            sort: 'newest',
        });
    };
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Products</h2>}
        >
            <Head title="Products" />
            
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
                    
                    {/* Filters and Search */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                                <div className="flex-1">
                                    <InputLabel htmlFor="search" value="Search" />
                                    <TextInput
                                        id="search"
                                        type="text"
                                        name="search"
                                        value={searchParams.search}
                                        className="mt-1 block w-full"
                                        placeholder="Search by title, SKU, or description"
                                        onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                                    />
                                </div>
                                
                                <div className="w-full md:w-1/4">
                                    <InputLabel htmlFor="store" value="Store" />
                                    <select
                                        id="store"
                                        name="store"
                                        value={searchParams.store}
                                        onChange={(e) => setSearchParams({ ...searchParams, store: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    >
                                        <option value="">All Stores</option>
                                        {stores && stores.length > 0 && stores.map((store) => (
                                            <option key={store.id} value={store.id}>
                                                {store.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="w-full md:w-1/4">
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                        id="status"
                                        name="status"
                                        value={searchParams.status}
                                        onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="in_stock">In Stock</option>
                                        <option value="low_stock">Low Stock</option>
                                        <option value="out_of_stock">Out of Stock</option>
                                    </select>
                                </div>
                                
                                <div className="w-full md:w-1/4">
                                    <InputLabel htmlFor="sort" value="Sort By" />
                                    <select
                                        id="sort"
                                        name="sort"
                                        value={searchParams.sort}
                                        onChange={(e) => setSearchParams({ ...searchParams, sort: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="title_asc">Title (A-Z)</option>
                                        <option value="title_desc">Title (Z-A)</option>
                                        <option value="stock_low">Stock (Low to High)</option>
                                        <option value="stock_high">Stock (High to Low)</option>
                                    </select>
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Products Table */}
                    {!products?.data || products.data.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-10 text-center">
                                <h3 className="text-xl font-medium text-gray-600 mb-4">No products found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchParams.search || searchParams.store || searchParams.status 
                                        ? "Try changing your search criteria or resetting filters."
                                        : "Connect a store integration and sync products to get started."}
                                </p>
                                
                                {!searchParams.search && !searchParams.store && !searchParams.status && can.sync_products && (
                                    <Link 
                                        href={route('store-integrations.index')} 
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Go to Store Integrations
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    {/* Desktop Table View */}
                                    <table className="w-full divide-y divide-gray-200 hidden md:table">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Store
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    SKU
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Stock
                                                </th>
                                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Last Updated
                                                </th>
                                                <th scope="col" className="relative px-4 py-3">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {products?.data && products.data.map((product) => (
                                                <tr key={product.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center">
                                                            {parseProductImage(product) ? (
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    <img className="h-10 w-10 rounded-md object-cover" src={parseProductImage(product)} alt={product.title} />
                                                                </div>
                                                            ) : (
                                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900 truncate max-w-[200px] md:max-w-[250px]" title={product.title}>
                                                                    {product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title}
                                                                </div>
                                                                <div className="text-sm text-gray-500 truncate max-w-[200px] md:max-w-[250px]">
                                                                    {product.description ? (
                                                                        product.description.length > 50 
                                                                            ? product.description.substring(0, 50) + '...'
                                                                            : product.description
                                                                    ) : 'No description'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center">
                                                            <span className="text-lg mr-2">{getPlatformIcon(product.store_integration?.platform)}</span>
                                                            <div className="text-sm text-gray-900">{product.store_integration?.name || 'Unknown'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="text-sm text-gray-900">{product.sku || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        {getStockStatus(product)}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm">
                                                        {product.last_sync_at 
                                                            ? new Date(product.last_sync_at).toLocaleString() 
                                                            : 'Never'}
                                                    </td>
                                                    <td className="px-4 py-4 text-right text-sm font-medium">
                                                        <div className="flex space-x-3 justify-end">
                                                            <Link
                                                                href={route('products.show', product.id)}
                                                                className="text-indigo-600 hover:text-indigo-700 flex items-center"
                                                            >
                                                                View
                                                                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                                </svg>
                                                            </Link>
                                                            
                                                            {can.edit_products && (
                                                                <Link
                                                                    href={route('products.edit', product.id)}
                                                                    className="text-indigo-600 hover:text-indigo-700 flex items-center"
                                                                >
                                                                    Edit
                                                                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                                    </svg>
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    
                                    {/* Mobile Card View */}
                                    <div className="md:hidden space-y-4 divide-y divide-gray-200">
                                        {products?.data && products.data.map((product) => (
                                            <div key={product.id} className="p-4 bg-white">
                                                <div className="flex items-center mb-3">
                                                    {parseProductImage(product) ? (
                                                        <div className="flex-shrink-0 h-14 w-14 mr-3">
                                                            <img className="h-14 w-14 rounded-md object-cover" src={parseProductImage(product)} alt={product.title} />
                                                        </div>
                                                    ) : (
                                                        <div className="flex-shrink-0 h-14 w-14 mr-3 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">{product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title}</h4>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            {product.description ? (
                                                                product.description.length > 50 
                                                                    ? product.description.substring(0, 50) + '...'
                                                                    : product.description
                                                            ) : 'No description'}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">Store</p>
                                                        <div className="flex items-center mt-1">
                                                            <span className="text-base mr-1">{getPlatformIcon(product.store_integration?.platform)}</span>
                                                            <span className="text-xs">{product.store_integration?.name || 'Unknown'}</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">SKU</p>
                                                        <p className="text-xs mt-1">{product.sku || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">Stock</p>
                                                        <div className="mt-1">
                                                            {getStockStatus(product)}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-medium">Last Updated</p>
                                                        <p className="text-xs mt-1">
                                                            {product.last_sync_at 
                                                                ? new Date(product.last_sync_at).toLocaleString() 
                                                                : 'Never'}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end space-x-3">
                                                    <Link
                                                        href={route('products.show', product.id)}
                                                        className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center"
                                                    >
                                                        View
                                                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                        </svg>
                                                    </Link>
                                                    
                                                    {can.edit_products && (
                                                        <Link
                                                            href={route('products.edit', product.id)}
                                                            className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center"
                                                        >
                                                            Edit
                                                            <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                            </svg>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Pagination */}
                            {products?.links && <Pagination links={products.links} />}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
