import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, syncLogs, stores, products, can, filters, flash }) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(!!flash?.success);
    const [searchParams, setSearchParams] = useState({
        search: filters?.search || '',
        store: filters?.store || '',
        product: filters?.product || '',
        status: filters?.status || '',
        sort: filters?.sort || 'newest',
    });
    const [debouncedSearch, setDebouncedSearch] = useState(searchParams.search);
    
    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchParams.search);
        }, 500);
        
        return () => clearTimeout(timer);
    }, [searchParams.search]);
    
    // Apply filters
    useEffect(() => {
        if (
            debouncedSearch !== filters?.search || 
            searchParams.store !== filters?.store || 
            searchParams.product !== filters?.product ||
            searchParams.status !== filters?.status || 
            searchParams.sort !== filters?.sort
        ) {
            applyFilters();
        }
    }, [debouncedSearch, searchParams.store, searchParams.product, searchParams.status, searchParams.sort]);
    
    const applyFilters = () => {
        const params = new URLSearchParams();
        
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (searchParams.store) params.append('store', searchParams.store);
        if (searchParams.product) params.append('product', searchParams.product);
        if (searchParams.status) params.append('status', searchParams.status);
        if (searchParams.sort) params.append('sort', searchParams.sort);
        
        router.get(`/inventory-sync-logs?${params.toString()}`, {}, { preserveState: true });
    };
    
    // Function to format dates
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };
    
    // Function to get platform icon
    const getPlatformIcon = (platform) => {
        switch (platform?.toLowerCase()) {
            case 'shopify': return '🛍️';
            case 'etsy': return '🧶';
            case 'amazon': return '📦';
            default: return '🏪';
        }
    };
    
    // Function to get sync status badge
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
    
    // Reset all filters
    const resetFilters = () => {
        setSearchParams({
            search: '',
            store: '',
            product: '',
            status: '',
            sort: 'newest',
        });
    };
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Inventory Sync Logs</h2>}
        >
            <Head title="Inventory Sync Logs" />
            
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
                    
                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <InputLabel htmlFor="search" value="Search" />
                                    <TextInput
                                        id="search"
                                        type="text"
                                        name="search"
                                        value={searchParams.search}
                                        className="mt-1 block w-full"
                                        placeholder="Search by ID, message, or product"
                                        onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                                    />
                                </div>
                                
                                <div>
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
                                
                                <div>
                                    <InputLabel htmlFor="product" value="Product" />
                                    <select
                                        id="product"
                                        name="product"
                                        value={searchParams.product}
                                        onChange={(e) => setSearchParams({ ...searchParams, product: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    >
                                        <option value="">All Products</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                        id="status"
                                        name="status"
                                        value={searchParams.status}
                                        onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="completed">Completed</option>
                                        <option value="failed">Failed</option>
                                        <option value="in_progress">In Progress</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-end">
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
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Sync Logs Table */}
                    {syncLogs.data.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-10 text-center">
                                <h3 className="text-xl font-medium text-gray-600 mb-4">No sync logs found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchParams.search || searchParams.store || searchParams.product || searchParams.status 
                                        ? "Try changing your search criteria or resetting filters."
                                        : "Sync logs will appear here after you perform inventory synchronization with your connected stores."}
                                </p>
                                
                                {!searchParams.search && !searchParams.store && !searchParams.product && !searchParams.status && (
                                    <Link 
                                        href={route('store-integrations.index')} 
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
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
                                                    ID
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Store
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Type
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="relative px-6 py-3">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {syncLogs.data.map((log) => (
                                                <tr key={log.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {log.id}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <span className="text-lg mr-2">{getPlatformIcon(log.storeIntegration?.platform)}</span>
                                                            <div className="text-sm text-gray-900">
                                                                {log.storeIntegration ? (
                                                                    <Link 
                                                                        href={route('store-integrations.show', log.storeIntegration.id)} 
                                                                        className="hover:text-indigo-600"
                                                                    >
                                                                        {log.storeIntegration.name}
                                                                    </Link>
                                                                ) : (
                                                                    'Unknown'
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {log.product ? (
                                                                <Link 
                                                                    href={route('products.show', log.product.id)} 
                                                                    className="hover:text-indigo-600"
                                                                >
                                                                    {log.product.title}
                                                                </Link>
                                                            ) : log.is_bulk ? (
                                                                <span className="italic text-gray-500">Bulk Sync</span>
                                                            ) : (
                                                                <span className="italic text-gray-500">Unknown</span>
                                                            )}
                                                        </div>
                                                        {log.product && (
                                                            <div className="text-xs text-gray-500">
                                                                SKU: {log.product.sku || 'N/A'}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                        {log.sync_type || 'N/A'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getSyncStatusBadge(log.status)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(log.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <Link
                                                            href={route('inventory-sync-logs.show', log.id)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Pagination */}
                            <Pagination links={syncLogs.links} />
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
