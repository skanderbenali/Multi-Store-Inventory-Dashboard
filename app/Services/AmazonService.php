<?php

namespace App\Services;

use App\Models\StoreIntegration;
use App\Models\Product;
use App\Models\InventorySyncLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AmazonService extends ApiService
{
    /**
     * Initialize the Amazon API service
     */
    protected function initializeService(): void
    {
        // Set the base URL for the Amazon SP-API
        $this->baseUrl = "https://sellingpartnerapi-na.amazon.com";
        
        // Amazon requires additional authentication steps in practice
        // Here we're using a simplified approach for demonstration
        $this->headers = [
            'x-amz-access-token' => $this->storeIntegration->api_token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ];
        
        // Amazon SP-API typically requires a longer timeout
        $this->timeout = 60;
    }
    
    /**
     * Get all products (listings) from Amazon seller account
     */
    public function getAllProducts(string $marketplaceId = null): array
    {
        $marketplaceId = $marketplaceId ?? $this->storeIntegration->marketplace_id;
        
        if (!$marketplaceId) {
            return [
                'success' => false,
                'error' => 'Marketplace ID is required'
            ];
        }
        
        $response = $this->get('catalog/2022-04-01/items', [
            'marketplaceIds' => $marketplaceId,
            'includedData' => 'summaries,attributes,dimensions,identifiers,images,productTypes,relationships,salesRanks'
        ]);
        
        if (!$response['success']) {
            return $response;
        }
        
        return [
            'success' => true,
            'data' => $response['data']['items'] ?? []
        ];
    }
    
    /**
     * Get inventory for products
     */
    public function getInventory(string $marketplaceId = null): array
    {
        $marketplaceId = $marketplaceId ?? $this->storeIntegration->marketplace_id;
        
        if (!$marketplaceId) {
            return [
                'success' => false,
                'error' => 'Marketplace ID is required'
            ];
        }
        
        $response = $this->get('fba/inventory/v1/summaries', [
            'marketplaceIds' => $marketplaceId,
            'granularityType' => 'Marketplace',
            'granularityId' => $marketplaceId
        ]);
        
        if (!$response['success']) {
            return $response;
        }
        
        return [
            'success' => true,
            'data' => $response['data']['inventorySummaries'] ?? []
        ];
    }
    
    /**
     * Get a single product from Amazon
     */
    public function getProduct(string $asin, string $marketplaceId = null): array
    {
        $marketplaceId = $marketplaceId ?? $this->storeIntegration->marketplace_id;
        
        if (!$marketplaceId) {
            return [
                'success' => false,
                'error' => 'Marketplace ID is required'
            ];
        }
        
        $response = $this->get("catalog/2022-04-01/items/{$asin}", [
            'marketplaceIds' => $marketplaceId,
            'includedData' => 'summaries,attributes,dimensions,identifiers,images,productTypes,relationships,salesRanks'
        ]);
        
        if (!$response['success']) {
            return $response;
        }
        
        return [
            'success' => true,
            'data' => $response['data'] ?? null
        ];
    }
    
    /**
     * Update inventory quantity for a product
     */
    public function updateInventory(string $sellerSku, int $quantity): array
    {
        $response = $this->put('fba/inventory/v1/items/' . $sellerSku, [
            'quantity' => $quantity
        ]);
        
        return $response;
    }
    
    /**
     * Sync all products from Amazon to the dashboard
     */
    public function syncProducts(): array
    {
        // Create a sync log
        $syncLog = new InventorySyncLog([
            'store_integration_id' => $this->storeIntegration->id,
            'status' => 'in_progress',
            'sync_type' => 'full',
            'started_at' => now()
        ]);
        $syncLog->save();
        
        try {
            // Get products from Amazon
            $productsResponse = $this->getAllProducts();
            
            if (!$productsResponse['success']) {
                $syncLog->update([
                    'status' => 'failed',
                    'message' => $productsResponse['error'],
                    'completed_at' => now()
                ]);
                
                return [
                    'success' => false,
                    'error' => $productsResponse['error'],
                    'sync_log_id' => $syncLog->id
                ];
            }
            
            // Get inventory data
            $inventoryResponse = $this->getInventory();
            
            if (!$inventoryResponse['success']) {
                $syncLog->update([
                    'status' => 'failed',
                    'message' => $inventoryResponse['error'],
                    'completed_at' => now()
                ]);
                
                return [
                    'success' => false,
                    'error' => $inventoryResponse['error'],
                    'sync_log_id' => $syncLog->id
                ];
            }
            
            $amazonProducts = $productsResponse['data'];
            $inventoryData = $inventoryResponse['data'];
            
            // Create inventory lookup by SKU
            $inventoryBySku = [];
            foreach ($inventoryData as $item) {
                $inventoryBySku[$item['sellerSku']] = $item;
            }
            
            $productsCreated = 0;
            $productsUpdated = 0;
            $productsSkipped = 0;
            $changes = [];
            
            foreach ($amazonProducts as $amazonProduct) {
                // Get the product details
                $summary = $amazonProduct['summaries'][0] ?? null;
                $identifiers = $amazonProduct['identifiers'] ?? [];
                
                if (!$summary) {
                    $productsSkipped++;
                    continue;
                }
                
                // Extract product data
                $asin = $amazonProduct['asin'] ?? null;
                $title = $summary['itemName'] ?? '';
                $sku = '';
                
                // Find SKU in identifiers
                foreach ($identifiers as $identifier) {
                    if (isset($identifier['identifierType']) && $identifier['identifierType'] === 'SKU') {
                        $sku = $identifier['identifier'] ?? '';
                        break;
                    }
                }
                
                if (empty($sku) || empty($asin)) {
                    $productsSkipped++;
                    continue;
                }
                
                // Get inventory data
                $inventoryItem = $inventoryBySku[$sku] ?? null;
                $quantity = $inventoryItem['availableQuantity'] ?? 0;
                
                // Get image URL
                $imageUrl = null;
                if (!empty($amazonProduct['images'])) {
                    $imageUrl = $amazonProduct['images'][0]['link'] ?? null;
                }
                
                // Check if product already exists
                $product = Product::where('external_id', $asin)
                    ->where('store_integration_id', $this->storeIntegration->id)
                    ->first();
                
                $productData = [
                    'title' => $title,
                    'description' => $summary['productDescription'] ?? '',
                    'sku' => $sku,
                    'barcode' => $asin, // Using ASIN as barcode
                    'quantity' => $quantity,
                    'price' => $summary['buyingPrice']['amount'] ?? 0,
                    'status' => 'active', // Assume all products from API are active
                    'image_url' => $imageUrl,
                    'last_synced_at' => now()
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
                            'external_id' => $asin,
                            'title' => $title,
                            'changes' => $changedFields
                        ];
                        
                        // Update product
                        $product->update($productData);
                        $productsUpdated++;
                    } else {
                        $productsSkipped++;
                    }
                } else {
                    // Create new product
                    $product = new Product([
                        'store_integration_id' => $this->storeIntegration->id,
                        'external_id' => $asin,
                        'external_url' => "https://www.amazon.com/dp/{$asin}",
                        ...$productData
                    ]);
                    
                    $product->save();
                    $productsCreated++;
                    
                    $changes[] = [
                        'product_id' => $product->id,
                        'external_id' => $asin,
                        'title' => $title,
                        'changes' => ['new_product' => true]
                    ];
                }
            }
            
            // Update sync log
            $syncLog->update([
                'status' => 'completed',
                'products_synced' => $productsCreated + $productsUpdated,
                'message' => "Sync completed: {$productsCreated} products created, {$productsUpdated} updated, {$productsSkipped} unchanged",
                'changes' => json_encode($changes),
                'completed_at' => now()
            ]);
            
            // Update store integration
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
            Log::error('Amazon sync error', [
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
    
    /**
     * Sync a single product from Amazon to the dashboard
     */
    public function syncProduct(string $asin): array
    {
        // Create a sync log
        $syncLog = new InventorySyncLog([
            'store_integration_id' => $this->storeIntegration->id,
            'status' => 'in_progress',
            'sync_type' => 'single',
            'started_at' => now()
        ]);
        $syncLog->save();
        
        try {
            // Get product from Amazon
            $response = $this->getProduct($asin);
            
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
            
            $amazonProduct = $response['data'];
            
            if (empty($amazonProduct)) {
                $syncLog->update([
                    'status' => 'failed',
                    'message' => 'Product not found',
                    'completed_at' => now()
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Product not found',
                    'sync_log_id' => $syncLog->id
                ];
            }
            
            // Get the product details
            $summary = $amazonProduct['summaries'][0] ?? null;
            $identifiers = $amazonProduct['identifiers'] ?? [];
            
            if (!$summary) {
                $syncLog->update([
                    'status' => 'failed',
                    'message' => 'Product summary not found',
                    'completed_at' => now()
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Product summary not found',
                    'sync_log_id' => $syncLog->id
                ];
            }
            
            // Extract product data
            $title = $summary['itemName'] ?? '';
            $sku = '';
            
            // Find SKU in identifiers
            foreach ($identifiers as $identifier) {
                if (isset($identifier['identifierType']) && $identifier['identifierType'] === 'SKU') {
                    $sku = $identifier['identifier'] ?? '';
                    break;
                }
            }
            
            if (empty($sku)) {
                $syncLog->update([
                    'status' => 'failed',
                    'message' => 'Product SKU not found',
                    'completed_at' => now()
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Product SKU not found',
                    'sync_log_id' => $syncLog->id
                ];
            }
            
            // Get inventory data for this SKU
            // In a real implementation, we'd need to make another API call
            // Here we're simplifying by setting a default quantity
            $quantity = 10; // Default quantity for demo
            
            // Get image URL
            $imageUrl = null;
            if (!empty($amazonProduct['images'])) {
                $imageUrl = $amazonProduct['images'][0]['link'] ?? null;
            }
            
            // Find or create product
            $product = Product::where('external_id', $asin)
                ->where('store_integration_id', $this->storeIntegration->id)
                ->first();
            
            $productData = [
                'title' => $title,
                'description' => $summary['productDescription'] ?? '',
                'sku' => $sku,
                'barcode' => $asin, // Using ASIN as barcode
                'quantity' => $quantity,
                'price' => $summary['buyingPrice']['amount'] ?? 0,
                'status' => 'active', // Assume all products from API are active
                'image_url' => $imageUrl,
                'last_synced_at' => now()
            ];
            
            $changes = [];
            
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
                
                $changes = [
                    'product_id' => $product->id,
                    'external_id' => $asin,
                    'title' => $title,
                    'changes' => $changedFields
                ];
                
                // Update product
                $product->update($productData);
                
                $status = 'updated';
            } else {
                // Create new product
                $product = new Product([
                    'store_integration_id' => $this->storeIntegration->id,
                    'external_id' => $asin,
                    'external_url' => "https://www.amazon.com/dp/{$asin}",
                    ...$productData
                ]);
                
                $product->save();
                
                $changes = [
                    'product_id' => $product->id,
                    'external_id' => $asin,
                    'title' => $title,
                    'changes' => ['new_product' => true]
                ];
                
                $status = 'created';
            }
            
            // Update sync log
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
            Log::error('Amazon product sync error', [
                'store_integration_id' => $this->storeIntegration->id,
                'asin' => $asin,
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
    
    /**
     * Push updated inventory from the dashboard to Amazon
     */
    public function pushInventory(Product $product, int $quantity): array
    {
        if (!$product->sku) {
            return [
                'success' => false,
                'error' => 'Product SKU is required for inventory updates'
            ];
        }
        
        // Create a sync log
        $syncLog = new InventorySyncLog([
            'store_integration_id' => $this->storeIntegration->id,
            'product_id' => $product->id,
            'status' => 'in_progress',
            'sync_type' => 'push',
            'started_at' => now()
        ]);
        $syncLog->save();
        
        try {
            // Update inventory on Amazon
            $response = $this->updateInventory($product->sku, $quantity);
            
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
            
            // Update product in database
            $product->update([
                'quantity' => $quantity,
                'last_synced_at' => now()
            ]);
            
            // Update sync log
            $syncLog->update([
                'status' => 'completed',
                'products_synced' => 1,
                'message' => "Inventory updated to {$quantity} units",
                'changes' => json_encode([
                    [
                        'product_id' => $product->id,
                        'external_id' => $product->external_id,
                        'title' => $product->title,
                        'changes' => [
                            'quantity' => [
                                'from' => $product->getOriginal('quantity'),
                                'to' => $quantity
                            ]
                        ]
                    ]
                ]),
                'completed_at' => now()
            ]);
            
            return [
                'success' => true,
                'data' => [
                    'product' => $product,
                    'sync_log_id' => $syncLog->id
                ]
            ];
        } catch (\Exception $e) {
            Log::error('Amazon inventory push error', [
                'store_integration_id' => $this->storeIntegration->id,
                'product_id' => $product->id,
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
}
