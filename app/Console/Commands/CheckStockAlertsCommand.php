<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\StockAlert;
use App\Services\InventorySyncService;
use App\Events\StockAlertTriggered;
use App\Notifications\StockAlertNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckStockAlertsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:check-alerts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check all active stock alerts and trigger any that have reached their threshold';

    /**
     * Execute the console command.
     *
     * @param  \App\Services\InventorySyncService  $syncService
     * @return int
     */
    public function handle(InventorySyncService $syncService)
    {
        $this->info("Checking for stock alerts...");
        
        $activeAlerts = StockAlert::where('is_active', true)
            ->whereNull('triggered_at')
            ->with('product', 'user')
            ->get();
            
        if ($activeAlerts->isEmpty()) {
            $this->info("No active alerts found");
            return 0;
        }
        
        $this->info("Found {$activeAlerts->count()} active alerts to check");
        
        $triggeredCount = 0;
        
        foreach ($activeAlerts as $alert) {
            $product = $alert->product;
            
            if (!$product) {
                $this->warn("Alert #{$alert->id}: Product not found");
                continue;
            }
            
            $this->info("Checking alert #{$alert->id} for product: {$product->title}");
            $this->info("  Current stock: {$product->quantity}, Threshold: {$alert->threshold}");
            
            if ($product->quantity <= $alert->threshold) {
                $this->warn("  ⚠ Stock alert triggered!");
                
                // Update the alert
                $alert->update([
                    'triggered_at' => now()
                ]);
                
                // Reload the alert with related data
                $alert->load(['product.storeIntegration', 'user']);
                
                // Broadcast the alert event for real-time notification
                event(new StockAlertTriggered($alert));
                
                // Send the notification via the notification system
                if ($alert->user) {
                    $alert->user->notify(new StockAlertNotification($alert));
                }
                
                Log::info('Stock alert triggered', [
                    'alert_id' => $alert->id,
                    'product_id' => $product->id,
                    'product_title' => $product->title,
                    'current_quantity' => $product->quantity,
                    'threshold' => $alert->threshold,
                    'user_id' => $alert->user_id,
                    'user_email' => $alert->user->email ?? 'Unknown'
                ]);
                
                $triggeredCount++;
            } else {
                $this->info("  ✓ Stock level OK");
            }
        }
        
        $this->info("Check completed. {$triggeredCount} alerts triggered.");
        
        return 0;
    }
}
