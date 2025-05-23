<?php

namespace App\Services;

use App\Models\StoreIntegration;
use App\Models\Product;
use App\Models\InventorySyncLog;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class EtsyService extends ApiService
{
    protected $oauthToken;
    
    
    protected function initializeService(): void
    {
        $this->baseUrl = "https://openapi.etsy.com/v3";
        
        $this->oauthToken = $this->storeIntegration->api_token;
        
        $this->headers = [
            'Authorization' => "Bearer {$this->oauthToken}",
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'x-api-key' => $this->storeIntegration->api_key
        ];
    }
    
    
    public function getShop(): array
    {
        $shopId = $this->storeIntegration->shop_id;
        
        if (!$shopId) {
            return [
                'success' => false,
                'error' => 'Shop ID is not set in the store integration'
            ];
        }
        
        return $this->get("application/shops/{$shopId}");
    }
    
    
    public function getAllListings(int $limit = 25, int $offset = 0): array
    {
        $shopId = $this->storeIntegration->shop_id;
        
        if (!$shopId) {
            return [
                'success' => false,
                'error' => 'Shop ID is not set in the store integration'
            ];
        }
        
        $response = $this->get("application/shops/{$shopId}/listings/active", [
            'limit' => $limit,
            'offset' => $offset,
            'includes' => 'Images,Inventory'
        ]);
        
        if (!$response['success']) {
            return $response;
        }
        
        return [
            'success' => true,
            'data' => $response['data']['results'] ?? [],
            'pagination' => $response['data']['pagination'] ?? null
        ];
    }
    
    
    public function getListing(string $listingId): array
    {
        $response = $this->get("application/listings/{$listingId}", [
            'includes' => 'Images,Inventory'
        ]);
        
        if (!$response['success']) {
            return $response;
        }
        
        return [
            'success' => true,
            'data' => $response['data'] ?? null
        ];
    }
    
    
    public function updateInventory(string $listingId, array $products): array
    {
        return $this->put("application/listings/{$listingId}/inventory", [
            'products' => $products
        ]);
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
            $allListings = [];
            $offset = 0;
            $limit = 100;
            $hasMore = true;
            
            while ($hasMore) {
                $response = $this->getAllListings($limit, $offset);
                
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
                
                $listings = $response['data'];
                $pagination = $response['pagination'];
                
                $allListings = array_merge($allListings, $listings);
                
                if (count($listings) < $limit) {
                    $hasMore = false;
                } else {
                    $offset += $limit;
                }
            }
            
            $productsCreated = 0;
            $productsUpdated = 0;
            $productsSkipped = 0;
            $changes = [];
            
            foreach ($allListings as $listing) {
                $quantity = $listing['quantity'] ?? 0;
                
                $imageUrl = null;
                if (!empty($listing['images'])) {
                    $imageUrl = $listing['images'][0]['url_fullxfull'] ?? null;
                }
                
                $product = Product::where('platform_product_id', $listing['listing_id'])
                    ->where('store_integration_id', $this->storeIntegration->id)
                    ->first();
                
                $productData = [
                    'title' => $listing['title'],
                    'description' => strip_tags($listing['description'] ?? ''),
                    'sku' => $listing['sku'] ?? null,
                    'quantity' => $quantity,
                    'price' => $listing['price']['amount'] / $listing['price']['divisor'] ?? 0,
                    'status' => $listing['state'] === 'active' ? 'active' : 'inactive',
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
                            'platform_product_id' => $listing['listing_id'],
                            'title' => $listing['title'],
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
                            'platform_product_id' => $listing['listing_id'],
                            'external_url' => $listing['url'] ?? "https://www.etsy.com/listing/{$listing['listing_id']}"
                        ],
                        $productData
                    );
                    $product = new Product($createData);
                    
                    $product->save();
                    $productsCreated++;
                    
                    $changes[] = [
                        'product_id' => $product->id,
                        'platform_product_id' => $listing['listing_id'],
                        'title' => $listing['title'],
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
            Log::error('Etsy sync error', [
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
    
    
    public function syncProduct(string $listingId): array
    {
        
        $syncLog = new InventorySyncLog([
            'store_integration_id' => $this->storeIntegration->id,
            'status' => 'in_progress',
            'sync_type' => 'manual',
            'started_at' => now()
        ]);
        $syncLog->save();
        
        try {
            
            $response = $this->getListing($listingId);
            
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
            
            $listing = $response['data'];
            
            if (empty($listing)) {
                $syncLog->update([
                    'status' => 'failed',
                    'message' => 'Listing not found',
                    'completed_at' => now()
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Listing not found',
                    'sync_log_id' => $syncLog->id
                ];
            }
            
            
            $quantity = $listing['quantity'] ?? 0;
            
            
            $imageUrl = null;
            if (!empty($listing['images'])) {
                $imageUrl = $listing['images'][0]['url_fullxfull'] ?? null;
            }
            
            
            $product = Product::where('platform_product_id', $listing['listing_id'])
                ->where('store_integration_id', $this->storeIntegration->id)
                ->first();
            
            $productData = [
                'title' => $listing['title'],
                'description' => strip_tags($listing['description'] ?? ''),
                'sku' => $listing['sku'] ?? null,
                'quantity' => $quantity,
                'price' => $listing['price']['amount'] / $listing['price']['divisor'] ?? 0,
                'status' => $listing['state'] === 'active' ? 'active' : 'inactive',
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
                    'platform_product_id' => $listing['listing_id'],
                    'title' => $listing['title'],
                    'changes' => $changedFields
                ];
                
                
                $product->update($productData);
                
                $status = 'updated';
            } else {
                
                $createData = array_merge(
                    [
                        'store_integration_id' => $this->storeIntegration->id,
                        'platform_product_id' => $listing['listing_id'],
                        'external_url' => $listing['url'] ?? "https://www.etsy.com/listing/{$listing['listing_id']}"
                    ],
                    $productData
                );
                $product = new Product($createData);
                
                $product->save();
                
                $changes = [
                    'product_id' => $product->id,
                    'platform_product_id' => $listing['listing_id'],
                    'title' => $listing['title'],
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
            Log::error('Etsy product sync error', [
                'store_integration_id' => $this->storeIntegration->id,
                'listing_id' => $listingId,
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
        
        $syncLog = new InventorySyncLog([
            'store_integration_id' => $this->storeIntegration->id,
            'product_id' => $product->id,
            'status' => 'in_progress',
            'sync_type' => 'manual',
            'started_at' => now()
        ]);
        $syncLog->save();
        
        try {
            $response = $this->getListing($product->platform_product_id);
            
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
            
            $listing = $response['data'];
            
            if (empty($listing)) {
                $syncLog->update([
                    'status' => 'failed',
                    'message' => 'Listing not found',
                    'completed_at' => now()
                ]);
                
                return [
                    'success' => false,
                    'error' => 'Listing not found',
                    'sync_log_id' => $syncLog->id
                ];
            }
            
            
            $products = $listing['inventory']['products'] ?? [];
            
            
            foreach ($products as &$prod) {
                foreach ($prod['offerings'] as &$offering) {
                    $offering['quantity'] = $quantity;
                }
            }
            
            $updateResponse = $this->updateInventory($product->platform_product_id, $products);
            
            if (!$updateResponse['success']) {
                $syncLog->update([
                    'status' => 'failed',
                    'message' => $updateResponse['error'],
                    'completed_at' => now()
                ]);
                
                return [
                    'success' => false,
                    'error' => $updateResponse['error'],
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
            Log::error('Etsy inventory push error', [
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
