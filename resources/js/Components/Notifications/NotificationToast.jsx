import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';

export default function NotificationToast({ notification, onClose }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 100);
        
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); 
        }, 5000);
        
        return () => clearTimeout(timer);
    }, []);

    const getTypeIcon = () => {
        switch (notification.type) {
            case 'stock-alert':
                return (
                    <div className="flex-shrink-0 flex items-center justify-center rounded-full h-10 w-10 bg-red-100">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'sync-completed':
                return (
                    <div className="flex-shrink-0 flex items-center justify-center rounded-full h-10 w-10 bg-green-100">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="flex-shrink-0 flex items-center justify-center rounded-full h-10 w-10 bg-blue-100">
                        <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const getActionLink = () => {
        if (notification.type === 'stock-alert' && notification.data?.product?.id) {
            return route('products.show', notification.data.product.id);
        } else if (notification.type === 'sync-completed') {
            if (notification.data?.product?.id) {
                return route('products.show', notification.data.product.id);
            } else if (notification.data?.store_integration?.id) {
                return route('store-integrations.show', notification.data.store_integration.id);
            }
        }
        return null;
    };

    const handleClose = (e) => {
        e.stopPropagation();
        setIsVisible(false);
        setTimeout(onClose, 300); 
    };

    const actionLink = getActionLink();
    const toastContent = (
        <div className={`fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="p-4">
                <div className="flex items-start">
                    {getTypeIcon()}
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={handleClose}
                        >
                            <span className="sr-only">Close</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            {actionLink && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <Link
                        href={actionLink}
                        className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        View Details
                    </Link>
                </div>
            )}
        </div>
    );

    return toastContent;
}
