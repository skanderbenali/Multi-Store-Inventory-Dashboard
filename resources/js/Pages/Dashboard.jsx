import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const StatCard = ({ title, value, icon, color, linkTo, linkText }) => {
    return (
        <div className={`bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border-t-4 ${color}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-gray-700">{title}</h3>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-full text-3xl">{icon}</div>
            </div>
            {linkTo && (
                <div className="mt-4">
                    <Link href={linkTo} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                        {linkText}
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
};

const StoreCard = ({ name, platform, productsCount, lastSync, linkTo }) => {
    const getPlatformIcon = (platform) => {
        switch (platform.toLowerCase()) {
            case 'shopify': return '🛍️';
            case 'etsy': return '🧶';
            case 'amazon': return '📦';
            default: return '🏪';
        }
    };

    const getPlatformColor = (platform) => {
        switch (platform.toLowerCase()) {
            case 'shopify': return 'bg-green-50 border-green-400';
            case 'etsy': return 'bg-orange-50 border-orange-400';
            case 'amazon': return 'bg-blue-50 border-blue-400';
            default: return 'bg-gray-50 border-gray-400';
        }
    };

    return (
        <div className={`rounded-lg shadow-sm hover:shadow-md transition-shadow ${getPlatformColor(platform)} p-5 border border-gray-100`}>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{name}</h3>
                <span className="text-2xl">{getPlatformIcon(platform)}</span>
            </div>
            <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                    <span className="font-medium">Products:</span> {productsCount}
                </p>
                <p className="text-sm text-gray-600">
                    <span className="font-medium">Last Sync:</span> {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
                </p>
            </div>
            <div className="mt-4">
                <Link href={linkTo} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                    View Details
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                </Link>
            </div>
        </div>
    );
};

const AlertItem = ({ product, threshold, status, createdAt, linkTo }) => {
    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'triggered': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Triggered</span>;
            case 'resolved': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Resolved</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">Pending</span>;
        }
    };

    return (
        <div className="border-b border-gray-200 py-3 last:border-b-0 hover:bg-gray-50 transition-colors px-2 -mx-2 rounded">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-medium">{product}</p>
                    <p className="text-sm text-gray-600">
                        Threshold: {threshold} | {new Date(createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusBadge(status)}
                    <Link href={linkTo} className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        View
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard({ auth, errors, stores, products, alerts, syncStats }) {
    // Example data - in a real app, this would come from the controller
    const demoStores = [
        { id: 1, name: 'My Shopify Store', platform: 'shopify', productsCount: 120, lastSync: new Date().toISOString() },
        { id: 2, name: 'Etsy Crafts', platform: 'etsy', productsCount: 45, lastSync: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, name: 'Amazon Sellers Account', platform: 'amazon', productsCount: 75, lastSync: new Date(Date.now() - 172800000).toISOString() },
    ];

    const demoAlerts = [
        { id: 1, product: 'Handmade Wool Scarf', threshold: 5, status: 'triggered', createdAt: new Date().toISOString() },
        { id: 2, product: 'Organic Cotton T-Shirt', threshold: 10, status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString() },
        { id: 3, product: 'Wooden Cutting Board', threshold: 3, status: 'resolved', createdAt: new Date(Date.now() - 172800000).toISOString() },
    ];

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Welcome to Your Texporta Hub! 👋</h2>
                        <p className="text-gray-600 mt-1">Manage your multi-store inventory from one central dashboard</p>
                    </div>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                            title="Total Products" 
                            value="240" 
                            icon="📦" 
                            color="border-t-indigo-500" 
                            linkTo="/products"
                            linkText="View All Products"
                        />
                        <StatCard 
                            title="Low Stock Items" 
                            value="18" 
                            icon="⚠️" 
                            color="border-t-amber-500" 
                            linkTo="/products?filter[stock_level]=low"
                            linkText="View Low Stock"
                        />
                        <StatCard 
                            title="Out of Stock" 
                            value="7" 
                            icon="🚫" 
                            color="border-t-red-500" 
                            linkTo="/products?filter[stock_level]=out"
                            linkText="View Out of Stock"
                        />
                        <StatCard 
                            title="Active Alerts" 
                            value="12" 
                            icon="🔔" 
                            color="border-t-purple-500" 
                            linkTo={route('stock-alerts.index')}
                            linkText="Manage Alerts"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Store Integrations */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                        <span className="mr-2">🏪</span> Store Integrations
                                    </h2>
                                    <Link href="/store-integrations" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                                        Manage Stores
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                        </svg>
                                    </Link>
                                </div>
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {demoStores.map(store => (
                                        <StoreCard 
                                            key={store.id}
                                            name={store.name}
                                            platform={store.platform}
                                            productsCount={store.productsCount}
                                            lastSync={store.lastSync}
                                            linkTo={`/store-integrations/${store.id}`}
                                        />
                                    ))}
                                    <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-300 transition-colors">
                                        <Link href="/store-integrations/create" className="text-indigo-600 hover:text-indigo-700 font-medium flex flex-col items-center">
                                            <span className="text-3xl mb-2">+</span>
                                            <span>Add Store</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Sync Activity */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
                                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                        <span className="mr-2">🔄</span> Recent Sync Activity
                                    </h2>
                                    <Link href="/inventory-sync-logs" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                                        View All Logs
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                        </svg>
                                    </Link>
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between mb-4">
                                        <div className="text-center px-4">
                                            <p className="text-sm text-gray-600">Total Syncs</p>
                                            <p className="text-xl font-bold">125</p>
                                        </div>
                                        <div className="text-center px-4 border-l border-gray-200">
                                            <p className="text-sm text-gray-600">Successful</p>
                                            <p className="text-xl font-bold text-green-600">108</p>
                                        </div>
                                        <div className="text-center px-4 border-l border-gray-200">
                                            <p className="text-sm text-gray-600">Failed</p>
                                            <p className="text-xl font-bold text-red-600">17</p>
                                        </div>
                                        <div className="text-center px-4 border-l border-gray-200">
                                            <p className="text-sm text-gray-600">Last Sync</p>
                                            <p className="text-sm font-bold">10 mins ago</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <Link href="/sync-dashboard" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                                            View Sync Dashboard
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stock Alerts */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
                                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                        <span className="mr-2">🔔</span> Recent Stock Alerts
                                    </h2>
                                    <Link href={route('stock-alerts.index')} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                                        View All
                                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                        </svg>
                                    </Link>
                                </div>
                                <div className="p-5">
                                    {demoAlerts.map(alert => (
                                        <AlertItem 
                                            key={alert.id}
                                            product={alert.product}
                                            threshold={alert.threshold}
                                            status={alert.status}
                                            createdAt={alert.createdAt}
                                            linkTo={route('stock-alerts.show', alert.id)}
                                        />
                                    ))}
                                </div>
                                <div className="p-5 border-t border-gray-200 bg-gray-50">
                                    <Link href={route('stock-alerts.create')} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                        </svg>
                                        Create New Alert
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                <span className="mr-2">⚡</span> Quick Actions
                            </h2>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/products/create" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
                                <span className="text-2xl mb-2">➕</span>
                                <span className="text-sm font-medium">Add Product</span>
                            </Link>
                            <Link href="/store-integrations/create" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
                                <span className="text-2xl mb-2">🔄</span>
                                <span className="text-sm font-medium">Connect Store</span>
                            </Link>
                            <Link href="/products?filter[stock_level]=low" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
                                <span className="text-2xl mb-2">📊</span>
                                <span className="text-sm font-medium">Stock Report</span>
                            </Link>
                            <Link href="/sync-dashboard" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all">
                                <span className="text-2xl mb-2">🔄</span>
                                <span className="text-sm font-medium">Sync All Stores</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
