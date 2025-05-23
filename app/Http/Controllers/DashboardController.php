<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StoreIntegration;
use App\Models\StockAlert;
use App\Models\InventorySyncLog;
use App\Services\InventorySyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    
    public function index(InventorySyncService $syncService)
    {
        $this->authorize('view dashboard');
        $integrationIds = Auth::user()->hasRole('admin')
            ? StoreIntegration::pluck('id')
            : Auth::user()->storeIntegrations()->pluck('id');
        $storeIntegrations = StoreIntegration::whereIn('id', $integrationIds)
            ->with('user:id,name')
            ->withCount('products')
            ->latest('last_sync_at')
            ->take(6)
            ->get();
        $productMetrics = $this->getProductMetrics($integrationIds);
        $recentAlerts = StockAlert::whereHas('product', function($query) use ($integrationIds) {
                $query->whereIn('store_integration_id', $integrationIds);
            })
            ->with(['product' => function($query) {
                $query->with('storeIntegration:id,name,platform');
            }])
            ->where('is_active', true)
            ->latest()
            ->take(5)
            ->get();
        $recentSyncs = InventorySyncLog::whereIn('store_integration_id', $integrationIds)
            ->with(['storeIntegration:id,name,platform', 'product:id,title,sku,images'])
            ->latest()
            ->take(5)
            ->get();
        $syncRecommendations = [];
        if (Auth::user()->can('sync products')) {
            $syncRecommendations = $syncService->getSyncRecommendations();
        }
        
        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'totalProducts' => $productMetrics['total'],
                'inStockProducts' => $productMetrics['inStock'],
                'lowStockProducts' => $productMetrics['lowStock'],
                'outOfStockProducts' => $productMetrics['outOfStock'],
                'activeAlerts' => $recentAlerts->where('triggered_at', '!=', null)->count(),
            ],
            'storeIntegrations' => $storeIntegrations,
            'recentAlerts' => $recentAlerts,
            'recentSyncs' => $recentSyncs,
            'syncRecommendations' => $syncRecommendations,
            'can' => [
                'create_integration' => Auth::user()->can('create store integrations'),
                'edit_integration' => Auth::user()->can('edit store integrations'),
                'sync_products' => Auth::user()->can('sync products'),
                'create_stock_alerts' => Auth::user()->can('create stock alerts'),
            ]
        ]);
    }
    
    
    private function getProductMetrics($integrationIds)
    {
        $totalProducts = Product::whereIn('store_integration_id', $integrationIds)->count();
        
        $lowStockThreshold = 5; 
        
        $inStockCount = Product::whereIn('store_integration_id', $integrationIds)
            ->where('quantity', '>', $lowStockThreshold)
            ->count();
            
        $lowStockCount = Product::whereIn('store_integration_id', $integrationIds)
            ->where('quantity', '>', 0)
            ->where('quantity', '<=', $lowStockThreshold)
            ->count();
            
        $outOfStockCount = Product::whereIn('store_integration_id', $integrationIds)
            ->where('quantity', '<=', 0)
            ->count();
            
        return [
            'total' => $totalProducts,
            'inStock' => $inStockCount,
            'lowStock' => $lowStockCount,
            'outOfStock' => $outOfStockCount,
        ];
    }
}

