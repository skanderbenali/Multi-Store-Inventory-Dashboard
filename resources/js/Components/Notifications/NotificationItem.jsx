import React from 'react';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';

export default function NotificationItem({ notification, onMarkAsRead }) {
    const getTypeIcon = () => {
        switch (notification.type) {
            case 'stock-alert':
                return (
                    <div className="flex-shrink-0 flex items-center justify-center bg-red-100 rounded-full h-10 w-10">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            case 'sync-completed':
                return (
                    <div className="flex-shrink-0 flex items-center justify-center bg-green-100 rounded-full h-10 w-10">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="flex-shrink-0 flex items-center justify-center bg-blue-100 rounded-full h-10 w-10">
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

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return format(date, 'MMM d, h:mm a');
    };

    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead(notification.id);
        }
    };

    const actionLink = getActionLink();
    const content = (
        <div className={`flex p-4 border-b hover:bg-gray-50 ${!notification.read ? 'bg-indigo-50' : ''}`}>
            {getTypeIcon()}
            <div className="ml-3 flex-1">
                <div className="flex items-baseline">
                    <span className="font-semibold text-gray-800">{notification.title}</span>
                    <span className="ml-2 text-xs text-gray-500">{formatTime(notification.timestamp)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </div>
            {!notification.read && (
                <div className="flex-shrink-0 ml-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                </div>
            )}
        </div>
    );

    return actionLink ? (
        <Link href={actionLink} onClick={handleClick}>
            {content}
        </Link>
    ) : (
        <div onClick={handleClick}>
            {content}
        </div>
    );
}
