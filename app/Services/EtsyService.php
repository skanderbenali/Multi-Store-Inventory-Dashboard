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
    
    /**
     * Initialize the Etsy API service
     */
    protected function initializeService(): void
    {
        // Set the base URL for the Etsy API
        $this->baseUrl = "https://openapi.etsy.com/v3";
        
        // Get OAuth token from credentials
        $this->oauthToken = $this->storeIntegration->api_token;
        
        // Set the headers for authentication
        $this->headers = [
            'Authorization' => "Bearer {$this->oauthToken}",
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'x-api-key' => $this->storeIntegration->api_key
        ];
    }
    
    /**
     * Get shop information
     */
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
    
    /**
     * Get all listings from the Etsy shop
     */
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
    
    /**
     * Get a single listing from Etsy
     */
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
    
    /**
     * Update the inventory for a listing
     */
    public function updateInventory(string $listingId, array $products): array
    {
        return $this->put("application/listings/{$listingId}/inventory", [
            'products' => $products
        ]);
    }
    
    /**
     * Sync all products from Etsy to the dashboard
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
            $allListings = [];
            $offset = 0;
            $limit = 100;
            $hasMore = true;
            
            // Paginate through all listings
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
                
                // Check if there are more listings
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
                // Get the inventory if available
                $quantity = $listing['quantity'] ?? 0;
                
                // Get primary image if available
                $imageUrl = null;
                if (!empty($listing['images'])) {
                    $imageUrl = $listing['images'][0]['url_fullxfull'] ?? null;
                }
                
                // Check if product already exists
                $product = Product::where('external_id', $listing['listing_id'])
                    ->where('store_integration_id', $this->storeIntegration->id)
                    ->first();
                
                $productData = [
                    'title' => $listing['title'],
                    'description' => strip_tags($listing['description'] ?? ''),
                    'sku' => $listing['sku'] ?? null,
                    'quantity' => $quantity,
                    'price' => $listing['price']['amount'] / $listing['price']['divisor'] ?? 0,
                    'status' => $listing['state'] === 'active' ? 'active' : 'inactive',
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
                            'external_id' => $listing['listing_id'],
                            'title' => $listing['title'],
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
                        'external_id' => $listing['listing_id'],
                        'external_url' => $listing['url'] ?? "https://www.etsy.com/listing/{$listing['listing_id']}",
                        ...$productData
                    ]);
                    
                    $product->save();
                    $productsCreated++;
                    
                    $changes[] = [
                        'product_id' => $product->id,
                        'external_id' => $listing['listing_id'],
                        'title' => $listing['title'],
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
    
    /**
     * Sync a single product from Etsy to the dashboard
     */
    public function syncProduct(string $listingId): array
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
            // Get product from Etsy
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
            
            // Get the inventory if available
            $quantity = $listing['quantity'] ?? 0;
            
            // Get primary image if available
            $imageUrl = null;
            if (!empty($listing['images'])) {
                $imageUrl = $listing['images'][0]['url_fullxfull'] ?? null;
            }
            
            // Find or create product
            $product = Product::where('external_id', $listing['listing_id'])
                ->where('store_integration_id', $this->storeIntegration->id)
                ->first();
            
            $productData = [
                'title' => $listing['title'],
                'description' => strip_tags($listing['description'] ?? ''),
                'sku' => $listing['sku'] ?? null,
                'quantity' => $quantity,
                'price' => $listing['price']['amount'] / $listing['price']['divisor'] ?? 0,
                'status' => $listing['state'] === 'active' ? 'active' : 'inactive',
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
                    'external_id' => $listing['listing_id'],
                    'title' => $listing['title'],
                    'changes' => $changedFields
                ];
                
                // Update product
                $product->update($productData);
                
                $status = 'updated';
            } else {
                // Create new product
                $product = new Product([
                    'store_integration_id' => $this->storeIntegration->id,
                    'external_id' => $listing['listing_id'],
                    'external_url' => $listing['url'] ?? "https://www.etsy.com/listing/{$listing['listing_id']}",
                    ...$productData
                ]);
                
                $product->save();
                
                $changes = [
                    'product_id' => $product->id,
                    'external_id' => $listing['listing_id'],
                    'title' => $listing['title'],
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
    
    /**
     * Push updated inventory from the dashboard to Etsy
     */
    public function pushInventory(Product $product, int $quantity): array
    {
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
            // Get current listing details to ensure we have the correct product data
            $response = $this->getListing($product->external_id);
            
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
            
            // Extract the products array that needs to be updated
            $products = $listing['inventory']['products'] ?? [];
            
            // Update the quantity in each product variation
            foreach ($products as &$prod) {
                foreach ($prod['offerings'] as &$offering) {
                    $offering['quantity'] = $quantity;
                }
            }
            
            // Send update to Etsy
            $updateResponse = $this->updateInventory($product->external_id, $products);
            
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
