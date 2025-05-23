import { useState, useEffect } from 'react';
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
    
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchParams.search);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [searchParams.search]);
    
    useEffect(() => {
        if (
            debouncedSearch !== filters?.search || 
            searchParams.store !== filters?.store || 
            searchParams.status !== filters?.status || 
            searchParams.sort !== filters?.sort
        ) {
            applyFilters();
        }
    }, [debouncedSearch, searchParams.store, searchParams.status, searchParams.sort]);
    
    const applyFilters = () => {
        const params = new URLSearchParams();
        
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (searchParams.store) params.append('store', searchParams.store);
        if (searchParams.status) params.append('status', searchParams.status);
        if (searchParams.sort) params.append('sort', searchParams.sort);
        
        router.get(`/products?${params.toString()}`, {}, { preserveState: true });
    };
    
    const getStockStatus = (product) => {
        if (product.quantity <= 0) {
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
                                        {stores.map((store) => (
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
                    {products.data.length === 0 ? (
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
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Store
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    SKU
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Stock
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Last Updated
                                                </th>
                                                <th scope="col" className="relative px-6 py-3">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {products.data.map((product) => (
                                                <tr key={product.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {product.image_url ? (
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    <img className="h-10 w-10 rounded-md object-cover" src={product.image_url} alt={product.title} />
                                                                </div>
                                                            ) : (
                                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{product.title}</div>
                                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                    {product.description ? (
                                                                        product.description.length > 50 
                                                                            ? product.description.substring(0, 50) + '...'
                                                                            : product.description
                                                                    ) : 'No description'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <span className="text-lg mr-2">{getPlatformIcon(product.storeIntegration?.platform)}</span>
                                                            <div className="text-sm text-gray-900">{product.storeIntegration?.name || 'Unknown'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{product.sku || 'N/A'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStockStatus(product)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {product.last_sync_at 
                                                            ? new Date(product.last_sync_at).toLocaleString() 
                                                            : 'Never'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex space-x-3 justify-end">
                                                            <Link
                                                                href={route('products.show', product.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                View
                                                            </Link>
                                                            
                                                            {can.edit_products && (
                                                                <Link
                                                                    href={route('products.edit', product.id)}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    Edit
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Pagination */}
                            <Pagination links={products.links} />
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
