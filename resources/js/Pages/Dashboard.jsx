import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const StatCard = ({ title, value, icon, color, linkTo, linkText }) => {
    return (
        <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <div className={`text-${color.replace('border-l-', '')} text-3xl`}>{icon}</div>
            </div>
            {linkTo && (
                <div className="mt-4">
                    <Link href={linkTo} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        {linkText} &rarr;
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
            case 'shopify': return 'bg-green-50 border-green-500';
            case 'etsy': return 'bg-orange-50 border-orange-500';
            case 'amazon': return 'bg-blue-50 border-blue-500';
            default: return 'bg-gray-50 border-gray-500';
        }
    };

    return (
        <div className={`rounded-lg shadow-md ${getPlatformColor(platform)} p-5`}>
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{name}</h3>
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
                <Link href={linkTo} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details &rarr;
                </Link>
            </div>
        </div>
    );
};

const AlertItem = ({ product, threshold, status, createdAt, linkTo }) => {
    const getStatusBadge = (status) => {
        switch (status.toLowerCase()) {
            case 'triggered': return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Triggered</span>;
            case 'resolved': return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Resolved</span>;
            default: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Pending</span>;
        }
    };

    return (
        <div className="border-b border-gray-200 py-3 last:border-b-0">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-medium">{product}</p>
                    <p className="text-sm text-gray-600">
                        Threshold: {threshold} | {new Date(createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusBadge(status)}
                    <Link href={linkTo} className="text-blue-600 hover:text-blue-800 text-sm">
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
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard 
                            title="Total Products" 
                            value="240" 
                            icon="📦" 
                            color="border-l-blue-500" 
                            linkTo="/products"
                            linkText="View All Products"
                        />
                        <StatCard 
                            title="Low Stock Items" 
                            value="18" 
                            icon="⚠️" 
                            color="border-l-yellow-500" 
                            linkTo="/products?filter[stock_level]=low"
                            linkText="View Low Stock"
                        />
                        <StatCard 
                            title="Out of Stock" 
                            value="7" 
                            icon="🚫" 
                            color="border-l-red-500" 
                            linkTo="/products?filter[stock_level]=out"
                            linkText="View Out of Stock"
                        />
                        <StatCard 
                            title="Active Alerts" 
                            value="12" 
                            icon="🔔" 
                            color="border-l-purple-500" 
                            linkTo="/stock-alerts"
                            linkText="Manage Alerts"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Store Integrations */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold">Store Integrations</h2>
                                    <Link href="/store-integrations" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        Manage Stores
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
                                    <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                                        <Link href="/store-integrations/create" className="text-blue-600 hover:text-blue-800 font-medium flex flex-col items-center">
                                            <span className="text-3xl mb-2">+</span>
                                            <span>Add Store</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Sync Activity */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-6">
                                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold">Recent Sync Activity</h2>
                                    <Link href="/inventory-sync-logs" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        View All Logs
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
                                        <Link href="/sync-dashboard" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            View Sync Dashboard &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stock Alerts */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
                                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                                    <h2 className="text-lg font-semibold">Recent Stock Alerts</h2>
                                    <Link href="/stock-alerts" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        View All
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
                                            linkTo={`/stock-alerts/${alert.id}`}
                                        />
                                    ))}
                                </div>
                                <div className="p-5 border-t border-gray-200 bg-gray-50">
                                    <Link href="/stock-alerts/create" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                        Create New Alert &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-5 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">Quick Actions</h2>
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/products/create" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors">
                                <span className="text-2xl mb-2">➕</span>
                                <span className="text-sm font-medium">Add Product</span>
                            </Link>
                            <Link href="/store-integrations/create" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors">
                                <span className="text-2xl mb-2">🔄</span>
                                <span className="text-sm font-medium">Connect Store</span>
                            </Link>
                            <Link href="/products?filter[stock_level]=low" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors">
                                <span className="text-2xl mb-2">📊</span>
                                <span className="text-sm font-medium">Stock Report</span>
                            </Link>
                            <Link href="/sync-dashboard" className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors">
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
