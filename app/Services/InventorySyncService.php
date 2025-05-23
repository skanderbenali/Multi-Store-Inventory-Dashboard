<?php

namespace App\Services;

use App\Models\StoreIntegration;
use App\Models\Product;
use App\Models\StockAlert;
use App\Models\InventorySyncLog;
use App\Events\StockAlertTriggered;
use App\Events\InventorySyncCompleted;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class InventorySyncService
{
    
    public function createPlatformService(StoreIntegration $storeIntegration): ?ApiService
    {
        switch (strtolower($storeIntegration->platform)) {
            case 'shopify':
                return new ShopifyService($storeIntegration);
            case 'etsy':
                return new EtsyService($storeIntegration);
            case 'amazon':
                return new AmazonService($storeIntegration);
            default:
                Log::error('Unsupported platform', [
                    'store_integration_id' => $storeIntegration->id,
                    'platform' => $storeIntegration->platform
                ]);
                return null;
        }
    }
    
    
    public function syncAllProducts(StoreIntegration $storeIntegration): array
    {
        if (!$storeIntegration->is_active) {
            return [
                'success' => false,
                'error' => 'Store integration is not active'
            ];
        }
        $service = $this->createPlatformService($storeIntegration);
        
        if (!$service) {
            return [
                'success' => false,
                'error' => 'Unsupported platform: ' . $storeIntegration->platform
            ];
        }
        
        
        $result = $service->syncProducts();
        if ($result['success']) {
            $this->checkStockAlerts($storeIntegration);
    
            // Broadcast sync completed event if we have a sync log ID
            if (isset($result['data']['sync_log_id'])) {
                $syncLog = InventorySyncLog::find($result['data']['sync_log_id']);
                if ($syncLog) {
                    event(new InventorySyncCompleted($syncLog, $storeIntegration->user_id));
                }
            }
        }
        
        return $result;
    }
    
    
    public function syncProduct(Product $product): array
    {
        $storeIntegration = $product->storeIntegration;
        if (!$storeIntegration->is_active) {
            return [
                'success' => false,
                'error' => 'Store integration is not active'
            ];
        }
        $service = $this->createPlatformService($storeIntegration);
        
        if (!$service) {
            return [
                'success' => false,
                'error' => 'Unsupported platform: ' . $storeIntegration->platform
            ];
        }
        
        $result = $service->syncProduct($product->platform_product_id);
        if ($result['success']) {
            $this->checkProductStockAlerts($product);
            
            if (isset($result['data']['sync_log_id'])) {
                $syncLog = InventorySyncLog::find($result['data']['sync_log_id']);
                if ($syncLog) {
                    event(new InventorySyncCompleted($syncLog, $product->storeIntegration->user_id));
                }
            }
        }
        
        return $result;
    }
    

    public function pushInventoryUpdate(Product $product, int $quantity): array
    {
        $storeIntegration = $product->storeIntegration;
        if (!$storeIntegration->is_active) {
            return [
                'success' => false,
                'error' => 'Store integration is not active'
            ];
        }
        $service = $this->createPlatformService($storeIntegration);
        
        if (!$service) {
            return [
                'success' => false,
                'error' => 'Unsupported platform: ' . $storeIntegration->platform
            ];
        }
        
        $result = $service->pushInventory($product, $quantity);
        if ($result['success']) {
            $this->checkProductStockAlerts($product);
            
            if (isset($result['data']['sync_log_id'])) {
                $syncLog = InventorySyncLog::find($result['data']['sync_log_id']);
                if ($syncLog) {
                    event(new InventorySyncCompleted($syncLog, $product->storeIntegration->user_id));
                }
            }
        }
        
        return $result;
    }
    
    
    public function checkStockAlerts(StoreIntegration $storeIntegration): void
    {
        $products = Product::where('store_integration_id', $storeIntegration->id)->get();
        
        foreach ($products as $product) {
            $this->checkProductStockAlerts($product);
        }
    }
    
    public function checkProductStockAlerts(Product $product): void
    {
        $alerts = StockAlert::where('product_id', $product->id)
            ->where('is_active', true)
            ->whereNull('triggered_at')
            ->get();
        
        foreach ($alerts as $alert) {
            if ($product->quantity <= $alert->threshold) {
                
                $alert->update([
                    'triggered_at' => now()
                ]);
                
                $alert->load(['product.storeIntegration', 'user']);
                event(new StockAlertTriggered($alert));
                
                if ($alert->user) {
                    $alert->user->notify(new \App\Notifications\StockAlertNotification($alert));
                }
                
                Log::info('Stock alert triggered', [
                    'alert_id' => $alert->id,
                    'product_id' => $product->id,
                    'product_title' => $product->title,
                    'current_quantity' => $product->quantity,
                    'threshold' => $alert->threshold
                ]);
            }
        }
    }
    
    
    public function syncAllStores(): array
    {
        $integrations = StoreIntegration::where('is_active', true)->get();
        $results = [];
        
        foreach ($integrations as $integration) {
            $results[$integration->id] = $this->syncAllProducts($integration);
        }
        
        return [
            'success' => true,
            'data' => $results
        ];
    }
    
    public function resetStockAlert(StockAlert $alert): bool
    {
        return $alert->update([
            'triggered_at' => null
        ]);
    }
    
    public function getSyncRecommendations(): array
    {
        $recommendations = [];
        $outdatedIntegrations = StoreIntegration::where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('last_sync_at')
                    ->orWhere('last_sync_at', '<', now()->subHours(24));
            })
            ->get();
        
        foreach ($outdatedIntegrations as $integration) {
            $recommendations[] = [
                'integration_id' => $integration->id,
                'name' => $integration->name,
                'platform' => $integration->platform,
                'last_sync_at' => $integration->last_sync_at,
                'reason' => 'Not synced in the last 24 hours'
            ];
        }
        $potentialMismatches = Product::whereNotNull('last_sync_at')
            ->whereHas('storeIntegration', function ($query) {
                $query->where('is_active', true);
            })
            ->where('last_sync_at', '<', now()->subHours(12))
            ->whereHas('stockAlerts', function ($query) {
                $query->where('is_active', true)
                    ->whereNotNull('triggered_at');
            })
            ->get();
        
        foreach ($potentialMismatches as $product) {
            $recommendations[] = [
                'product_id' => $product->id,
                'title' => $product->title,
                'store_integration_id' => $product->store_integration_id,
                'store_name' => $product->storeIntegration->name,
                'last_sync_at' => $product->last_sync_at,
                'reason' => 'Product has triggered alerts and may need inventory verification'
            ];
        }
        
        return $recommendations;
    }
}

