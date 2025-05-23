import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Edit({ auth, alert, can }) {
    const { data, setData, patch, processing, errors } = useForm({
        threshold: alert.threshold || '',
        is_active: alert.is_active,
        notification_email: alert.notification_email,
        notification_dashboard: alert.notification_dashboard,
    });
    
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('stock-alerts.update', alert.id));
    };
    
    const resetTriggeredStatus = () => {
        if (confirm('Are you sure you want to reset the triggered status? This will re-enable the alert if it was triggered.')) {
            router.post(route('stock-alerts.reset', alert.id));
        }
    };
    
    const confirmDeletion = () => {
        setConfirmingDeletion(true);
    };
    
    const deleteAlert = () => {
        router.delete(route('stock-alerts.destroy', alert.id));
    };
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Stock Alert</h2>}
        >
            <Head title="Edit Stock Alert" />
            
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
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Edit Stock Alert</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Modify the alert settings for {alert.product.title}.
                                            </p>
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
                                        
                                        {/* Reset Triggered Status */}
                                        {alert.triggered_at && (
                                            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-md">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="text-sm font-medium text-yellow-800">Alert Triggered</h3>
                                                        <div className="mt-2 text-sm text-yellow-700">
                                                            <p>This alert was triggered on {new Date(alert.triggered_at).toLocaleString()}. Reset the status to re-enable the alert.</p>
                                                        </div>
                                                        <div className="mt-4">
                                                            <button
                                                                type="button"
                                                                onClick={resetTriggeredStatus}
                                                                className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
                                                            >
                                                                Reset Triggered Status
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <div className="flex items-center justify-end mt-8 space-x-4">
                                            <Link
                                                href={route('stock-alerts.index')}
                                                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Cancel
                                            </Link>
                                            <PrimaryButton disabled={processing || !data.threshold}>
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </PrimaryButton>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            
                            {/* Danger Zone */}
                            {can.delete_stock_alerts && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mt-6">
                                    <div className="p-6 border-t-4 border-red-500">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Once you delete an alert, there is no going back. Please be certain.
                                            </p>
                                        </div>
                                        
                                        {!confirmingDeletion ? (
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                onClick={confirmDeletion}
                                            >
                                                Delete this alert
                                            </button>
                                        ) : (
                                            <div>
                                                <p className="text-sm text-gray-700 mb-4">
                                                    Are you sure you want to delete this stock alert? This action cannot be undone.
                                                </p>
                                                <div className="flex space-x-3">
                                                    <button
                                                        type="button"
                                                        onClick={deleteAlert}
                                                        className="px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                    >
                                                        Yes, Delete Alert
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400 focus:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                                        onClick={() => setConfirmingDeletion(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="col-span-1">
                            {/* Product Information */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
                                    
                                    <div className="flex items-center mb-4">
                                        {alert.product.image_url ? (
                                            <div className="flex-shrink-0 h-16 w-16">
                                                <img 
                                                    className="h-16 w-16 rounded-md object-cover" 
                                                    src={alert.product.image_url} 
                                                    alt={alert.product.title} 
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
                                            <h4 className="text-lg font-medium text-gray-900">{alert.product.title}</h4>
                                            <p className="text-sm text-gray-500">SKU: {alert.product.sku || 'N/A'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="border-t border-gray-200 pt-4 mt-2">
                                        <dl className="space-y-3">
                                            <div className="flex justify-between">
                                                <dt className="text-sm font-medium text-gray-500">Current Stock:</dt>
                                                <dd className={`text-sm font-bold ${
                                                    alert.product.quantity <= 0 
                                                        ? "text-red-600" 
                                                        : alert.product.quantity <= alert.threshold 
                                                            ? "text-yellow-600" 
                                                            : "text-green-600"
                                                }`}>
                                                    {alert.product.quantity}
                                                </dd>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <dt className="text-sm font-medium text-gray-500">Current Alert Threshold:</dt>
                                                <dd className="text-sm font-bold text-gray-900">{alert.threshold}</dd>
                                            </div>
                                            
                                            <div className="flex justify-between">
                                                <dt className="text-sm font-medium text-gray-500">Low Stock Threshold:</dt>
                                                <dd className="text-sm font-bold text-gray-900">{alert.product.low_stock_threshold}</dd>
                                            </div>
                                            
                                            {alert.product.store_integration && (
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-500">Store:</dt>
                                                    <dd className="text-sm text-gray-900">{alert.product.store_integration.name}</dd>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between">
                                                <dt className="text-sm font-medium text-gray-500">Alert Created:</dt>
                                                <dd className="text-sm text-gray-900">{new Date(alert.created_at).toLocaleString()}</dd>
                                            </div>
                                            
                                            {alert.triggered_at && (
                                                <div className="flex justify-between">
                                                    <dt className="text-sm font-medium text-gray-500">Last Triggered:</dt>
                                                    <dd className="text-sm text-red-600">{new Date(alert.triggered_at).toLocaleString()}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                    
                                    <div className="mt-6">
                                        <Link 
                                            href={route('products.show', alert.product.id)} 
                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                        >
                                            View Product Details →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Alert Status */}
                            <div className={`overflow-hidden shadow-sm sm:rounded-lg mt-6 ${
                                !alert.is_active 
                                    ? "bg-gray-50 border border-gray-200"
                                    : alert.triggered_at
                                        ? "bg-red-50 border border-red-200"
                                        : alert.product.quantity <= alert.threshold
                                            ? "bg-yellow-50 border border-yellow-200"
                                            : "bg-green-50 border border-green-200"
                            }`}>
                                <div className="p-6">
                                    <h3 className="text-md font-medium mb-3 text-gray-900">Alert Status</h3>
                                    
                                    {!alert.is_active ? (
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-gray-800">Inactive</h3>
                                                <div className="mt-1 text-sm text-gray-600">
                                                    <p>This alert is currently inactive and will not trigger notifications.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : alert.triggered_at ? (
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">Triggered</h3>
                                                <div className="mt-1 text-sm text-red-700">
                                                    <p>This alert has been triggered and will not notify again until reset.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : alert.product.quantity <= alert.threshold ? (
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">Low Stock</h3>
                                                <div className="mt-1 text-sm text-yellow-700">
                                                    <p>Current stock level is below or equal to the alert threshold.</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-green-800">Healthy</h3>
                                                <div className="mt-1 text-sm text-green-700">
                                                    <p>Current stock level is above the alert threshold.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
