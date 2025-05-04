<?php

namespace App\Console\Commands;

use App\Models\StoreIntegration;
use App\Services\InventorySyncService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncAllStoresCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:sync-all-stores {--store-id= : Sync specific store by ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync products from all active store integrations or a specific store';

    /**
     * Execute the console command.
     *
     * @param  \App\Services\InventorySyncService  $syncService
     * @return int
     */
    public function handle(InventorySyncService $syncService)
    {
        $storeId = $this->option('store-id');
        
        if ($storeId) {
            $this->info("Syncing products for store ID: {$storeId}");
            
            $store = StoreIntegration::find($storeId);
            
            if (!$store) {
                $this->error("Store with ID {$storeId} not found");
                return 1;
            }
            
            if (!$store->is_active) {
                $this->warn("Store with ID {$storeId} is not active");
                return 1;
            }
            
            $result = $syncService->syncAllProducts($store);
            
            if ($result['success']) {
                $this->info("Sync completed successfully for {$store->name}");
                $this->info("Created: " . ($result['data']['created'] ?? 0));
                $this->info("Updated: " . ($result['data']['updated'] ?? 0));
                $this->info("Skipped: " . ($result['data']['skipped'] ?? 0));
                return 0;
            } else {
                $this->error("Sync failed: " . ($result['error'] ?? 'Unknown error'));
                return 1;
            }
        } else {
            $this->info("Syncing products for all active stores");
            
            $stores = StoreIntegration::where('is_active', true)->get();
            
            if ($stores->isEmpty()) {
                $this->warn("No active stores found");
                return 0;
            }
            
            $this->info("Found {$stores->count()} active stores");
            
            $success = true;
            
            foreach ($stores as $store) {
                $this->info("Syncing {$store->name} (ID: {$store->id})...");
                
                $result = $syncService->syncAllProducts($store);
                
                if ($result['success']) {
                    $this->info("  ✓ Sync completed successfully");
                    $this->info("    Created: " . ($result['data']['created'] ?? 0));
                    $this->info("    Updated: " . ($result['data']['updated'] ?? 0));
                    $this->info("    Skipped: " . ($result['data']['skipped'] ?? 0));
                } else {
                    $this->error("  ✗ Sync failed: " . ($result['error'] ?? 'Unknown error'));
                    $success = false;
                }
                
                // Add a small delay between syncs to prevent rate limiting
                if (!$store->is($stores->last())) {
                    sleep(2);
                }
            }
            
            return $success ? 0 : 1;
        }
    }
}
