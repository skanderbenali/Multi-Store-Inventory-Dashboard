<?php

namespace App\Events;

use App\Models\InventorySyncLog;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InventorySyncCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The sync log instance.
     *
     * @var \App\Models\InventorySyncLog
     */
    public $syncLog;
    
    /**
     * The user ID who should receive this notification.
     *
     * @var int
     */
    protected $userId;

    /**
     * Create a new event instance.
     *
     * @param  \App\Models\InventorySyncLog  $syncLog
     * @param  int  $userId
     * @return void
     */
    public function __construct(InventorySyncLog $syncLog, int $userId)
    {
        $this->syncLog = $syncLog;
        $this->userId = $userId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->userId);
    }
    
    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        $data = [
            'id' => $this->syncLog->id,
            'status' => $this->syncLog->status,
            'sync_type' => $this->syncLog->sync_type,
            'products_synced' => $this->syncLog->products_synced,
            'started_at' => $this->syncLog->started_at,
            'completed_at' => $this->syncLog->completed_at,
            'store_integration' => [
                'id' => $this->syncLog->storeIntegration->id,
                'name' => $this->syncLog->storeIntegration->name,
                'platform' => $this->syncLog->storeIntegration->platform,
            ],
        ];
        
        // Add product info if this is a single product sync
        if ($this->syncLog->product_id) {
            $product = $this->syncLog->product;
            $data['product'] = [
                'id' => $product->id,
                'title' => $product->title,
                'sku' => $product->sku,
                'quantity' => $product->quantity,
            ];
        }
        
        return $data;
    }
    
    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'inventory.sync.completed';
    }
}
