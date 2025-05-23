import React, { useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';

export default function ProductStatusChart({ inStock, lowStock, outOfStock }) {
    const canvasRef = useRef(null);
    
    // Calculate total for percentages
    const total = inStock + lowStock + outOfStock;
    
    // Calculate percentages
    const inStockPercent = total > 0 ? Math.round((inStock / total) * 100) : 0;
    const lowStockPercent = total > 0 ? Math.round((lowStock / total) * 100) : 0;
    const outOfStockPercent = total > 0 ? Math.round((outOfStock / total) * 100) : 0;
    
    useEffect(() => {
        // Skip if there's no data
        if (total === 0) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.8;
        const innerRadius = radius * 0.6;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        
        const colors = {
            inStock: '#10B981', 
            lowStock: '#F59E0B', 
            outOfStock: '#EF4444',
        };
        
        // Draw segments
        let startAngle = -0.5 * Math.PI; 
        
        if (inStock > 0) {
            const sliceAngle = (inStock / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = colors.inStock;
            ctx.fill();
            startAngle += sliceAngle;
        }
        
        // Draw low stock segment
        if (lowStock > 0) {
            const sliceAngle = (lowStock / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = colors.lowStock;
            ctx.fill();
            startAngle += sliceAngle;
        }
        
        // Draw out of stock segment
        if (outOfStock > 0) {
            const sliceAngle = (outOfStock / total) * 2 * Math.PI;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
            ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
            ctx.closePath();
            ctx.fillStyle = colors.outOfStock;
            ctx.fill();
        }
        
        // Draw center text with total products
        ctx.fillStyle = '#111827';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(total, centerX, centerY - 12);
        
        ctx.fillStyle = '#6B7280';
        ctx.font = '14px Arial';
        ctx.fillText('Products', centerX, centerY + 12);
        
    }, [inStock, lowStock, outOfStock, total]);

    return (
        <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-1/2 mb-6 md:mb-0 flex justify-center">
                <canvas 
                    ref={canvasRef} 
                    width={200} 
                    height={200} 
                    className="max-w-full h-auto"
                ></canvas>
            </div>
            
            <div className="w-full md:w-1/2 pl-0 md:pl-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Inventory Status</h4>
                
                <div className="space-y-4">
                    <div>
                        <Link 
                            href={route('products.index', { status: 'in_stock' })}
                            className="flex items-center justify-between p-3 rounded-md hover:bg-green-50 transition-colors"
                        >
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                <span className="text-gray-700">In Stock</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="font-semibold text-gray-900">{inStock}</span>
                                <span className="text-xs text-gray-500">({inStockPercent}%)</span>
                            </div>
                        </Link>
                    </div>
                    
                    <div>
                        <Link 
                            href={route('products.index', { status: 'low_stock' })}
                            className="flex items-center justify-between p-3 rounded-md hover:bg-yellow-50 transition-colors"
                        >
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                                <span className="text-gray-700">Low Stock</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="font-semibold text-gray-900">{lowStock}</span>
                                <span className="text-xs text-gray-500">({lowStockPercent}%)</span>
                            </div>
                        </Link>
                    </div>
                    
                    <div>
                        <Link 
                            href={route('products.index', { status: 'out_of_stock' })}
                            className="flex items-center justify-between p-3 rounded-md hover:bg-red-50 transition-colors"
                        >
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                                <span className="text-gray-700">Out of Stock</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="font-semibold text-gray-900">{outOfStock}</span>
                                <span className="text-xs text-gray-500">({outOfStockPercent}%)</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
