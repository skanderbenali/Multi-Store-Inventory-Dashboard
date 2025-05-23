<?php

namespace App\Services;

use App\Models\StoreIntegration;
use App\Models\Product;
use App\Models\InventorySyncLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ShopifyService extends ApiService
{

    protected function initializeService(): void
    {

        $shopUrl = $this->storeIntegration->shop_url;
        
        $shopUrl = preg_replace('#^https?://#', '', $shopUrl);
        
        $shopUrl = rtrim($shopUrl, '/');
        
        $this->baseUrl = "https://{$shopUrl}/admin/api/2023-07";
        
        $this->headers = [
            'X-Shopify-Access-Token' => $this->storeIntegration->api_key,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ];
    }
    
    public function getAllProducts(int $limit = 50): array
    {
        $response = $this->get('products.json', [
            'limit' => $limit,
            'fields' => 'id,title,handle,variants,images,status,created_at,updated_at'
        ]);
        
        if (!$response['success']) {
            return $response;
        }
        
        return [
            'success' => true,
            'data' => $response['data']['products'] ?? []
        ];
    }
    
    
    public function getProduct(string $productId): array
    {
        $response = $this->get("products/{$productId}.json");
        
        if (!$response['success']) {
            return $response;
        }
        
        return [
            'success' => true,
            'data' => $response['data']['product'] ?? null
        ];
    }
    
    public function getInventoryLevels(string $inventoryItemId): array
    {
        $response = $this->get("inventory_levels.json", [
            'inventory_item_ids' => $inventoryItemId
        ]);
        
        if (!$response['success']) {
            return $response;
        }
        
        return [
            'success' => true,
            'data' => $response['data']['inventory_levels'] ?? []
        ];
    }
    

    public function updateInventoryLevel(string $inventoryItemId, string $locationId, int $quantity): array
    {
        $response = $this->post("inventory_levels/set.json", [
            'inventory_item_id' => $inventoryItemId,
            'location_id' => $locationId,
            'available' => $quantity
        ]);
        
        return $response;
    }
    
    
    public function syncProducts(): array
    {

        $syncLog = new InventorySyncLog([
            'store_integration_id' => $this->storeIntegration->id,
            'status' => 'in_progress',
            'sync_type' => 'manual',
            'started_at' => now()
        ]);
        $syncLog->save();
        
        try {
            $response = $this->getAllProducts(250);
            
            if (!$response['success']) {
                $syncLog->update([
                    'status' => 'failed',
                    'message' => $response['error'],
                    'completed_at' => now()
                ]);
                
                return [
                    'success' => false,
                    'error' => $response['error'],
                    'sync_log_id' => $syncLog->id
                ];
            }
            
            $shopifyProducts = $response['data'];
            $productsCreated = 0;
            $productsUpdated = 0;
            $productsSkipped = 0;
            $changes = [];
            
            foreach ($shopifyProducts as $shopifyProduct) {
                
                if (empty($shopifyProduct['variants'])) {
                    $productsSkipped++;
                    continue;
                }
                
                $variant = $shopifyProduct['variants'][0];
                $product = Product::where('platform_product_id', $shopifyProduct['id'])
                    ->where('store_integration_id', $this->storeIntegration->id)
                    ->first();
                
                $imageUrl = null;
                if (!empty($shopifyProduct['images'])) {
                    $imageUrl = $shopifyProduct['images'][0]['src'] ?? null;
                }
                
                $productData = [
                    'title' => $shopifyProduct['title'],
                    'description' => strip_tags($shopifyProduct['body_html'] ?? ''),
                    'sku' => $variant['sku'] ?? null,
                    'barcode' => $variant['barcode'] ?? null,
                    'quantity' => $variant['inventory_quantity'] ?? 0,
                    'price' => $variant['price'] ?? 0,
                    'cost' => $variant['cost'] ?? 0,
                    'status' => $shopifyProduct['status'] === 'active' ? 'active' : 'inactive',
                    'images' => $imageUrl ? json_encode([$imageUrl]) : null,
                    'variant_id' => $variant['id'] ?? null,
                    'inventory_item_id' => $variant['inventory_item_id'] ?? null,
                    'last_sync_at' => now()
                ];
                
                if ($product) {
                    // Track changes
                    $oldValues = $product->only(array_keys($productData));
                    $changedFields = [];
                    
                    foreach ($productData as $key => $value) {
                        if ($oldValues[$key] != $value) {
                            $changedFields[$key] = [
                                'from' => $oldValues[$key],
                                'to' => $value
                            ];
                        }
                    }
                    
                    if (!empty($changedFields)) {
                        $changes[] = [
                            'product_id' => $product->id,
                            'platform_product_id' => $shopifyProduct['id'],
                            'title' => $shopifyProduct['title'],
                            'changes' => $changedFields
                        ];
                        
                        $product->update($productData);
                        $productsUpdated++;
                    } else {
                        $productsSkipped++;
                    }
                } else {
                    $createData = array_merge(
                        [
                            'store_integration_id' => $this->storeIntegration->id,
                            'platform_product_id' => $shopifyProduct['id'],
                            'external_url' => "https://{$this->storeIntegration->shop_url}/products/{$shopifyProduct['handle']}"
                        ],
                        $productData
                    );
                    $product = new Product($createData);
                    
                    $product->save();
                    $productsCreated++;
                    
                    $changes[] = [
                        'product_id' => $product->id,
                        'platform_product_id' => $shopifyProduct['id'],
                        'title' => $shopifyProduct['title'],
                        'changes' => ['new_product' => true]
                    ];
                }
            }
            
            $syncLog->update([
                'status' => 'completed',
                'products_synced' => $productsCreated + $productsUpdated,
                'message' => "Sync completed: {$productsCreated} products created, {$productsUpdated} updated, {$productsSkipped} unchanged",
                'changes' => json_encode($changes),
                'completed_at' => now()
            ]);
            
            $this->storeIntegration->update([
                'last_sync_at' => now(),
                'products_count' => Product::where('store_integration_id', $this->storeIntegration->id)->count()
            ]);
            
            return [
                'success' => true,
                'data' => [
                    'created' => $productsCreated,
                    'updated' => $productsUpdated,
                    'skipped' => $productsSkipped,
                    'sync_log_id' => $syncLog->id
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Shopify sync error', [
                'store_integration_id' => $this->storeIntegration->id,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $syncLog->update([
                'status' => 'failed',
                'message' => $e->getMessage(),
                'completed_at' => now()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'sync_log_id' => $syncLog->id
            ];
        }
    }
    
    public function syncProduct(string $productId): array
    {
        $syncLog = new InventorySyncLog([
            'store_integration_id' => $this->storeIntegration->id,
            'status' => 'in_progress',
            'sync_type' => 'manual',
            'started_at' => now()
        ]);
        $syncLog->save();
        
        try {
            $response = $this->getProduct($productId);
            
            if (!$response['success']) {
                $syncLog->update([
                    'status' => 'failed',
                    'message' => $response['error'],
                    'completed_at' => now()
                ]);
                
                return [
                    'success' => false,
                    'error' => $response['error'],
                    'sync_log_id' => $syncLog->id
                ];
            }
            
            $shopifyProduct = $response['data'];
            
            if (empty($shopifyProduct) || empty($shopifyProduct['variants'])) {
                $syncLog->update([
                    'status' => 'failed',
                    'message' => 'Product not found or has no variants',
                    'completed_at' => now()
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Product not found or has no variants',
                    'sync_log_id' => $syncLog->id
                ];
            }
            
            $variant = $shopifyProduct['variants'][0];
            
            $product = Product::where('platform_product_id', $shopifyProduct['id'])
                ->where('store_integration_id', $this->storeIntegration->id)
                ->first();
            
            $imageUrl = null;
            if (!empty($shopifyProduct['images'])) {
                $imageUrl = $shopifyProduct['images'][0]['src'] ?? null;
            }
            
            $productData = [
                'title' => $shopifyProduct['title'],
                'description' => strip_tags($shopifyProduct['body_html'] ?? ''),
                'sku' => $variant['sku'] ?? null,
                'barcode' => $variant['barcode'] ?? null,
                'quantity' => $variant['inventory_quantity'] ?? 0,
                'price' => $variant['price'] ?? 0,
                'cost' => $variant['cost'] ?? 0,
                'status' => $shopifyProduct['status'] === 'active' ? 'active' : 'inactive',
                'images' => $imageUrl ? json_encode([$imageUrl]) : null,
                'variant_id' => $variant['id'] ?? null,
                'inventory_item_id' => $variant['inventory_item_id'] ?? null,
                'last_sync_at' => now()
            ];
            
            $changes = [];
            
            if ($product) {
                $oldValues = $product->only(array_keys($productData));
                $changedFields = [];
                
                foreach ($productData as $key => $value) {
                    if ($oldValues[$key] != $value) {
                        $changedFields[$key] = [
                            'from' => $oldValues[$key],
                            'to' => $value
                        ];
                    }
                }
                
                $changes = [
                    'product_id' => $product->id,
                    'platform_product_id' => $shopifyProduct['id'],
                    'title' => $shopifyProduct['title'],
                    'changes' => $changedFields
                ];
                
                $product->update($productData);
                
                $status = 'updated';
            } else {
                $createData = array_merge(
                    [
                        'store_integration_id' => $this->storeIntegration->id,
                        'platform_product_id' => $shopifyProduct['id'],
                        'external_url' => "https://{$this->storeIntegration->shop_url}/products/{$shopifyProduct['handle']}"
                    ],
                    $productData
                );
                $product = new Product($createData);
                
                $product->save();
                
                $changes = [
                    'product_id' => $product->id,
                    'platform_product_id' => $shopifyProduct['id'],
                    'title' => $shopifyProduct['title'],
                    'changes' => ['new_product' => true]
                ];
                
                $status = 'created';
            }
            
            $syncLog->update([
                'status' => 'completed',
                'product_id' => $product->id,
                'products_synced' => 1,
                'message' => "Product {$status} successfully",
                'changes' => json_encode([$changes]),
                'completed_at' => now()
            ]);
            
            return [
                'success' => true,
                'data' => [
                    'status' => $status,
                    'product' => $product,
                    'sync_log_id' => $syncLog->id
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Shopify product sync error', [
                'store_integration_id' => $this->storeIntegration->id,
                'product_id' => $productId,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            $syncLog->update([
                'status' => 'failed',
                'message' => $e->getMessage(),
                'completed_at' => now()
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'sync_log_id' => $syncLog->id
            ];
        }
    }
    
    public function pushInventory(Product $product, int $quantity): array
    {
        if (!$product->inventory_item_id) {
            return [
                'success' => false,
                'error' => 'Product has no inventory item ID'
            ];
        }
        
        $levelsResponse = $this->getInventoryLevels($product->inventory_item_id);
        
        if (!$levelsResponse['success'] || empty($levelsResponse['data'])) {
            return [
                'success' => false,
                'error' => $levelsResponse['error'] ?? 'No inventory levels found'
            ];
        }
        
        $inventoryLevel = $levelsResponse['data'][0];
        $locationId = $inventoryLevel['location_id'];
        
        $response = $this->updateInventoryLevel(
            $product->inventory_item_id,
            $locationId,
            $quantity
        );
        
        if ($response['success']) {

            $product->update([
                'quantity' => $quantity,
                'last_sync_at' => now()
            ]);
            
            $syncLog = new InventorySyncLog([
                'store_integration_id' => $this->storeIntegration->id,
                'product_id' => $product->id,
                'status' => 'completed',
                'sync_type' => 'manual',
                'products_synced' => 1,
                'started_at' => now(),
                'completed_at' => now(),
                'message' => "Inventory updated to {$quantity} units",
                'changes' => json_encode([
                    [
                        'product_id' => $product->id,
                        'platform_product_id' => $product->platform_product_id,
                        'title' => $product->title,
                        'changes' => [
                            'quantity' => [
                                'from' => $product->getOriginal('quantity'),
                                'to' => $quantity
                            ]
                        ]
                    ]
                ])
            ]);
            $syncLog->save();
            
            return [
                'success' => true,
                'data' => [
                    'product' => $product,
                    'sync_log_id' => $syncLog->id
                ]
            ];
        }
        
        return $response;
    }
}
