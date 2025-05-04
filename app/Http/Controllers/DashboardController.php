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
    /**
     * Display the dashboard with key metrics and data.
     *
     * @param  \App\Services\InventorySyncService  $syncService
     * @return \Inertia\Response
     */
    public function index(InventorySyncService $syncService)
    {
        $this->authorize('view dashboard');
        
        // Get integrations the user has access to
        $integrationIds = Auth::user()->hasRole('admin')
            ? StoreIntegration::pluck('id')
            : Auth::user()->storeIntegrations()->pluck('id');
            
        // Get store integrations for the dashboard
        $storeIntegrations = StoreIntegration::whereIn('id', $integrationIds)
            ->with('user:id,name')
            ->withCount('products')
            ->latest('last_sync_at')
            ->take(6)
            ->get();
            
        // Get product metrics
        $productMetrics = $this->getProductMetrics($integrationIds);
        
        // Get recent stock alerts
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
            
        // Get recent sync logs
        $recentSyncs = InventorySyncLog::whereIn('store_integration_id', $integrationIds)
            ->with(['storeIntegration:id,name,platform', 'product:id,title,sku,image_url'])
            ->latest()
            ->take(5)
            ->get();
            
        // Get sync recommendations if user can sync products
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
    
    /**
     * Get product metrics for the dashboard.
     *
     * @param  \Illuminate\Support\Collection  $integrationIds
     * @return array
     */
    private function getProductMetrics($integrationIds)
    {
        $totalProducts = Product::whereIn('store_integration_id', $integrationIds)->count();
        
        $lowStockThreshold = 5; // Default threshold
        
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
