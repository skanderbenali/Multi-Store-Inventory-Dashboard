import React, { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import NotificationItem from './NotificationItem';
import NotificationToast from './NotificationToast';

export default function NotificationCenter() {
    const { auth } = usePage().props;
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [newNotification, setNewNotification] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (window.Echo && auth.user) {
            const userId = auth.user.id;

            window.Echo.private(`user.${userId}`)
                .listen('.stock.alert.triggered', (e) => {
                    const notification = {
                        id: `stock-alert-${Date.now()}`,
                        type: 'stock-alert',
                        title: 'Stock Alert',
                        message: `${e.product.title} has reached the low stock threshold (${e.threshold} units). Current stock: ${e.product.quantity} units.`,
                        data: e,
                        read: false,
                        timestamp: new Date()
                    };
                    
                    addNotification(notification);
                    showToast(notification);
                });

            window.Echo.private(`user.${userId}`)
                .listen('.inventory.sync.completed', (e) => {
                    const notification = {
                        id: `sync-${e.id}`,
                        type: 'sync-completed',
                        title: 'Sync Completed',
                        message: e.product 
                            ? `Sync completed for ${e.product.title}: ${e.status}` 
                            : `Sync completed for ${e.store_integration.name}: ${e.products_synced} products synced`,
                        data: e,
                        read: false,
                        timestamp: new Date()
                    };
                    
                    addNotification(notification);
                    showToast(notification);
                });

            return () => {
                window.Echo.leave(`user.${userId}`);
            };
        }
    }, [auth.user]);

    const addNotification = (notification) => {
        setNotifications(prev => {
            const exists = prev.some(n => n.id === notification.id);
            if (exists) return prev;
            
            return [notification, ...prev];
        });
        
        setUnreadCount(prev => prev + 1);
    };

    const showToast = (notification) => {
        setNewNotification(notification);
        
        setTimeout(() => {
            setNewNotification(null);
        }, 5000);
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
    };

    const markAsRead = (id) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === id 
                    ? { ...notification, read: true } 
                    : notification
            )
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <div className="relative">
            <button 
                className="relative p-1 text-white hover:text-white/80 focus:outline-none"
                onClick={toggleNotifications}
            >
                <svg 
                    className="w-6 h-6" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            
            {showNotifications && (
                <div className="absolute right-0 z-50 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                        <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                        <button 
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                            onClick={markAllAsRead}
                        >
                            Mark all as read
                        </button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-500">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map(notification => (
                                    <NotificationItem 
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={markAsRead}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="px-4 py-2 bg-gray-50 border-t text-xs text-center text-gray-500">
                        Real-time notifications
                    </div>
                </div>
            )}
            
            {newNotification && (
                <NotificationToast
                    notification={newNotification}
                    onClose={() => setNewNotification(null)}
                />
            )}
        </div>
    );
}
