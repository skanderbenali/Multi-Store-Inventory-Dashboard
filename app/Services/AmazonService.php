<?php

namespace App\Services;

use App\Models\StoreIntegration;
use App\Models\Product;
use App\Models\InventorySyncLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AmazonService extends ApiService
{

    protected function initializeService(): void
    {
        // Set the base URL for the Amazon SP-API
        $this->baseUrl = "https://sellingpartnerapi-na.amazon.com";
        
        $this->headers = [
            'x-amz-access-token' => $this->storeIntegration->api_token,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json'
        ];
        
        $this->timeout = 60;
    }
    
   
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
    

    public function updateInventory(string $sellerSku, int $quantity): array
    {
        $response = $this->put('fba/inventory/v1/items/' . $sellerSku, [
            'quantity' => $quantity
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
            
            $inventoryBySku = [];
            foreach ($inventoryData as $item) {
                $inventoryBySku[$item['sellerSku']] = $item;
            }
            
            $productsCreated = 0;
            $productsUpdated = 0;
            $productsSkipped = 0;
            $changes = [];
            
            foreach ($amazonProducts as $amazonProduct) {
                $summary = $amazonProduct['summaries'][0] ?? null;
                $identifiers = $amazonProduct['identifiers'] ?? [];
                
                if (!$summary) {
                    $productsSkipped++;
                    continue;
                }

                $asin = $amazonProduct['asin'] ?? null;
                $title = $summary['itemName'] ?? '';
                $sku = '';

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
                
                $inventoryItem = $inventoryBySku[$sku] ?? null;
                $quantity = $inventoryItem['availableQuantity'] ?? 0;
                
                $imageUrl = null;
                if (!empty($amazonProduct['images'])) {
                    $imageUrl = $amazonProduct['images'][0]['link'] ?? null;
                }
                
                $product = Product::where('platform_product_id', $asin)
                    ->where('store_integration_id', $this->storeIntegration->id)
                    ->first();
                
                $productData = [
                    'title' => $title,
                    'description' => $summary['productDescription'] ?? '',
                    'sku' => $sku,
                    'barcode' => $asin, 
                    'quantity' => $quantity,
                    'price' => $summary['buyingPrice']['amount'] ?? 0,
                    'status' => 'active', 
                    'images' => $imageUrl ? json_encode([$imageUrl]) : null,
                    'last_sync_at' => now()
                ];
                
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
                    
                    if (!empty($changedFields)) {
                        $changes[] = [
                            'product_id' => $product->id,
                            'platform_product_id' => $asin,
                            'title' => $title,
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
                            'platform_product_id' => $asin,
                            'external_url' => "https://www.amazon.com/dp/{$asin}"
                        ],
                        $productData
                    );
                    $product = new Product($createData);
                    
                    $product->save();
                    $productsCreated++;
                    
                    $changes[] = [
                        'product_id' => $product->id,
                        'platform_product_id' => $asin,
                        'title' => $title,
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
    
    public function syncProduct(string $asin): array
    {
        $syncLog = new InventorySyncLog([
            'store_integration_id' => $this->storeIntegration->id,
            'status' => 'in_progress',
            'sync_type' => 'manual',
            'started_at' => now()
        ]);
        $syncLog->save();
        
        try {

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
            
            $title = $summary['itemName'] ?? '';
            $sku = '';
            
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
            
            
            $quantity = 10; // Default quantity for demo
            
            $imageUrl = null;
            if (!empty($amazonProduct['images'])) {
                $imageUrl = $amazonProduct['images'][0]['link'] ?? null;
            }
            

            $product = Product::where('platform_product_id', $asin)
                ->where('store_integration_id', $this->storeIntegration->id)
                ->first();
            
            $productData = [
                'title' => $title,
                'description' => $summary['productDescription'] ?? '',
                'sku' => $sku,
                'barcode' => $asin, 
                'quantity' => $quantity,
                'price' => $summary['buyingPrice']['amount'] ?? 0,
                'status' => 'active', 
                'images' => $imageUrl ? json_encode([$imageUrl]) : null,
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
                    'platform_product_id' => $asin,
                    'title' => $title,
                    'changes' => $changedFields
                ];
                
              
                $product->update($productData);
                
                $status = 'updated';
            } else {
                
                $createData = array_merge(
                    [
                        'store_integration_id' => $this->storeIntegration->id,
                        'platform_product_id' => $asin,
                        'external_url' => "https://www.amazon.com/dp/{$asin}"
                    ],
                    $productData
                );
                $product = new Product($createData);
                
                $product->save();
                
                $changes = [
                    'product_id' => $product->id,
                    'platform_product_id' => $asin,
                    'title' => $title,
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
    
    
    public function pushInventory(Product $product, int $quantity): array
    {
        if (!$product->sku) {
            return [
                'success' => false,
                'error' => 'Product SKU is required for inventory updates'
            ];
        }
        
        $syncLog = new InventorySyncLog([
            'store_integration_id' => $this->storeIntegration->id,
            'product_id' => $product->id,
            'status' => 'in_progress',
            'sync_type' => 'manual',
            'started_at' => now()
        ]);
        $syncLog->save();
        
        try {
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
            
            $product->update([
                'quantity' => $quantity,
                'last_sync_at' => now()
            ]);
            
            $syncLog->update([
                'status' => 'completed',
                'products_synced' => 1,
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
