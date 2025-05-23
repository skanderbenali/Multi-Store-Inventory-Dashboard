import React from 'react';
import { Link } from '@inertiajs/react';

export default function StatisticCard({ title, value, icon, color, linkTo }) {
    const colorClasses = {
        blue: {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            icon: 'text-blue-500',
        },
        green: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            icon: 'text-green-500',
        },
        yellow: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            icon: 'text-yellow-500',
        },
        red: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            icon: 'text-red-500',
        },
        purple: {
            bg: 'bg-purple-100',
            text: 'text-purple-800',
            icon: 'text-purple-500',
        },
        gray: {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
            icon: 'text-gray-500',
        },
    };
    
    const classes = colorClasses[color] || colorClasses.gray;
    
    const iconSvg = {
        box: (
            <svg className={`h-8 w-8 ${classes.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8 4l-8 4m8-4l-8-4m8 4v4m-16-4l8 4" />
            </svg>
        ),
        alert: (
            <svg className={`h-8 w-8 ${classes.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        'empty-box': (
            <svg className={`h-8 w-8 ${classes.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
        ),
        bell: (
            <svg className={`h-8 w-8 ${classes.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        ),
        sync: (
            <svg className={`h-8 w-8 ${classes.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        ),
        store: (
            <svg className={`h-8 w-8 ${classes.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        ),
    };
    
    const selectedIcon = iconSvg[icon] || iconSvg.box;
    
    const cardContent = (
        <div className={`p-6 rounded-lg shadow-sm border border-gray-200 ${classes.bg} transition-all duration-200 hover:shadow-md`}>
            <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-sm">
                    {selectedIcon}
                </div>
                <div className="text-right">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className={`text-2xl font-bold ${classes.text}`}>{value}</p>
                </div>
            </div>
        </div>
    );
    
    // If linkTo is provided, wrap the card in a Link
    if (linkTo) {
        return (
            <Link href={linkTo}>
                {cardContent}
            </Link>
        );
    }
    
    return cardContent;
}
