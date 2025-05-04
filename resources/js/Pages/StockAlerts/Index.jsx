import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, alerts, products, can, filters, flash }) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(!!flash?.success);
    const [searchParams, setSearchParams] = useState({
        search: filters?.search || '',
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
            searchParams.product !== filters?.product || 
            searchParams.status !== filters?.status || 
            searchParams.sort !== filters?.sort
        ) {
            applyFilters();
        }
    }, [debouncedSearch, searchParams.product, searchParams.status, searchParams.sort]);
    
    const applyFilters = () => {
        const params = new URLSearchParams();
        
        if (debouncedSearch) params.append('search', debouncedSearch);
        if (searchParams.product) params.append('product', searchParams.product);
        if (searchParams.status) params.append('status', searchParams.status);
        if (searchParams.sort) params.append('sort', searchParams.sort);
        
        router.get(`/stock-alerts?${params.toString()}`, {}, { preserveState: true });
    };
    
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleString();
    };
    
    // Function to get alert status badge
    const getAlertStatusBadge = (alert) => {
        if (!alert.is_active) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Inactive
                </span>
            );
        }
        
        if (alert.triggered_at) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Triggered
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
            </span>
        );
    };
    
    // Function to get stock status badge
    const getStockStatusBadge = (alert) => {
        const product = alert.product;
        
        if (product.quantity <= 0) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Out of Stock ({product.quantity})
                </span>
            );
        }
        
        if (product.quantity <= alert.threshold) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Low Stock ({product.quantity})
                </span>
            );
        }
        
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                In Stock ({product.quantity})
            </span>
        );
    };
    
    // Function to handle toggle alert status
    const toggleAlertStatus = (alertId, currentStatus) => {
        router.patch(route('stock-alerts.update', alertId), {
            is_active: !currentStatus,
        });
    };
    
    // Reset all filters
    const resetFilters = () => {
        setSearchParams({
            search: '',
            product: '',
            status: '',
            sort: 'newest',
        });
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Stock Alerts</h2>}
        >
            <Head title="Stock Alerts" />
            
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
                    
                    {/* Filters and Create Button */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                                
                                {can.create_stock_alerts && (
                                    <Link
                                        href={route('stock-alerts.create')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm"
                                    >
                                        Create Alert
                                    </Link>
                                )}
                            </div>
                            
                            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                                <div className="flex-1">
                                    <InputLabel htmlFor="search" value="Search Products" />
                                    <TextInput
                                        id="search"
                                        type="text"
                                        name="search"
                                        value={searchParams.search}
                                        className="mt-1 block w-full"
                                        placeholder="Search by product name or SKU"
                                        onChange={(e) => setSearchParams({ ...searchParams, search: e.target.value })}
                                    />
                                </div>
                                
                                <div className="w-full md:w-1/4">
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
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="triggered">Triggered</option>
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
                                        <option value="threshold_low">Threshold (Low to High)</option>
                                        <option value="threshold_high">Threshold (High to Low)</option>
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
                    
                    {/* Alerts Table */}
                    {alerts.data.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-10 text-center">
                                <h3 className="text-xl font-medium text-gray-600 mb-4">No stock alerts found</h3>
                                <p className="text-gray-500 mb-6">
                                    {searchParams.search || searchParams.product || searchParams.status 
                                        ? "Try changing your search criteria or resetting filters."
                                        : "Set up alerts to be notified when product stock falls below a certain threshold."}
                                </p>
                                
                                {!searchParams.search && !searchParams.product && !searchParams.status && can.create_stock_alerts && (
                                    <Link 
                                        href={route('stock-alerts.create')} 
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Create Your First Alert
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
                                                    Threshold
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Current Stock
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Created
                                                </th>
                                                <th scope="col" className="relative px-6 py-3">
                                                    <span className="sr-only">Actions</span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {alerts.data.map((alert) => (
                                                <tr key={alert.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {alert.product.image_url ? (
                                                                <div className="flex-shrink-0 h-10 w-10">
                                                                    <img 
                                                                        className="h-10 w-10 rounded-md object-cover" 
                                                                        src={alert.product.image_url} 
                                                                        alt={alert.product.title} 
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    <Link 
                                                                        href={route('products.show', alert.product.id)} 
                                                                        className="hover:text-indigo-600"
                                                                    >
                                                                        {alert.product.title}
                                                                    </Link>
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    SKU: {alert.product.sku || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">{alert.threshold} units</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getStockStatusBadge(alert)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {getAlertStatusBadge(alert)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(alert.created_at)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex space-x-3 justify-end">
                                                            {can.toggle_stock_alerts && (
                                                                <button
                                                                    onClick={() => toggleAlertStatus(alert.id, alert.is_active)}
                                                                    className={`${
                                                                        alert.is_active 
                                                                            ? "text-red-600 hover:text-red-800" 
                                                                            : "text-green-600 hover:text-green-800"
                                                                    }`}
                                                                >
                                                                    {alert.is_active ? 'Disable' : 'Enable'}
                                                                </button>
                                                            )}
                                                            
                                                            <Link
                                                                href={route('stock-alerts.edit', alert.id)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                Edit
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            {/* Pagination */}
                            <Pagination links={alerts.links} />
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
