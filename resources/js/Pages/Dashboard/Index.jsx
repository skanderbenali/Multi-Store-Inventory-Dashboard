import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import StatisticCard from './Components/StatisticCard';
import StorePlatformCard from './Components/StorePlatformCard';
import StockAlertCard from './Components/StockAlertCard';
import ProductStatusChart from './Components/ProductStatusChart';
import RecentSyncCard from './Components/RecentSyncCard';

export default function Dashboard({ auth, stats, storeIntegrations, recentAlerts, recentSyncs, can }) {
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatisticCard 
                            title="Total Products" 
                            value={stats.totalProducts} 
                            icon="box" 
                            color="blue"
                            linkTo={route('products.index')}
                        />
                        <StatisticCard 
                            title="Low Stock Items" 
                            value={stats.lowStockProducts} 
                            icon="alert" 
                            color="yellow"
                            linkTo={route('products.index', { status: 'low_stock' })}
                        />
                        <StatisticCard 
                            title="Out of Stock" 
                            value={stats.outOfStockProducts} 
                            icon="empty-box" 
                            color="red"
                            linkTo={route('products.index', { status: 'out_of_stock' })}
                        />
                        <StatisticCard 
                            title="Active Alerts" 
                            value={stats.activeAlerts} 
                            icon="bell" 
                            color="purple"
                            linkTo={route('stock-alerts.index')}
                        />
                    </div>
                    
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">  
                        <div className="lg:col-span-2 space-y-6">
                            {/* Store Integrations */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Store Integrations</h3>
                                        <Link 
                                            href={route('store-integrations.index')} 
                                            className="text-sm text-indigo-600 hover:text-indigo-900"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    
                                    {storeIntegrations.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No store integrations</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Get started by connecting your first e-commerce platform.
                                            </p>
                                            {can.create_integration && (
                                                <div className="mt-6">
                                                    <Link
                                                        href={route('store-integrations.create')}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                                    >
                                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                        </svg>
                                                        Add Store Integration
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {storeIntegrations.map((integration) => (
                                                <StorePlatformCard 
                                                    key={integration.id} 
                                                    integration={integration}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Product Status Chart */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Inventory Status</h3>
                                    </div>
                                    
                                    {stats.totalProducts > 0 ? (
                                        <ProductStatusChart 
                                            inStock={stats.inStockProducts}
                                            lowStock={stats.lowStockProducts}
                                            outOfStock={stats.outOfStockProducts}
                                        />
                                    ) : (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Connect a store integration to sync products.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Recent Sync Activity */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Recent Sync Activity</h3>
                                        <Link 
                                            href={route('inventory-sync-logs.index')} 
                                            className="text-sm text-indigo-600 hover:text-indigo-900"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    
                                    {recentSyncs.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No sync activity</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Sync activity will appear here once you sync with your stores.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {recentSyncs.map((sync) => (
                                                <RecentSyncCard 
                                                    key={sync.id} 
                                                    sync={sync}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Right column */}
                        <div className="space-y-6">
                            {/* Stock Alerts */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">Stock Alerts</h3>
                                        <Link 
                                            href={route('stock-alerts.index')} 
                                            className="text-sm text-indigo-600 hover:text-indigo-900"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                    
                                    {recentAlerts.length === 0 ? (
                                        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No stock alerts</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                You don't have any active stock alerts at the moment.
                                            </p>
                                            {can.create_stock_alerts && (
                                                <div className="mt-6">
                                                    <Link
                                                        href={route('stock-alerts.create')}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                                                    >
                                                        <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                        </svg>
                                                        Create Alert
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {recentAlerts.map((alert) => (
                                                <StockAlertCard 
                                                    key={alert.id} 
                                                    alert={alert}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                                    
                                    <div className="space-y-3">
                                        {can.sync_products && (
                                            <Link
                                                href={route('store-integrations.index')}
                                                className="flex items-center p-3 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                                            >
                                                <svg className="h-5 w-5 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                <span className="text-indigo-700 font-medium">Sync Inventory</span>
                                            </Link>
                                        )}
                                        
                                        {can.create_integration && (
                                            <Link
                                                href={route('store-integrations.create')}
                                                className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                                            >
                                                <svg className="h-5 w-5 text-green-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <span className="text-green-700 font-medium">Add Store</span>
                                            </Link>
                                        )}
                                        
                                        {can.create_stock_alerts && (
                                            <Link
                                                href={route('stock-alerts.create')}
                                                className="flex items-center p-3 bg-yellow-50 hover:bg-yellow-100 rounded-md transition-colors"
                                            >
                                                <svg className="h-5 w-5 text-yellow-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <span className="text-yellow-700 font-medium">New Alert</span>
                                            </Link>
                                        )}
                                        
                                        <Link
                                            href={route('products.index')}
                                            className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                                        >
                                            <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <span className="text-blue-700 font-medium">View Products</span>
                                        </Link>
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
