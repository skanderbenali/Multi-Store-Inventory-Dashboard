<?php

namespace App\Events;

use App\Models\StockAlert;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockAlertTriggered implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * The stock alert instance.
     *
     * @var \App\Models\StockAlert
     */
    public $stockAlert;

    /**
     * Create a new event instance.
     *
     * @param  \App\Models\StockAlert  $stockAlert
     * @return void
     */
    public function __construct(StockAlert $stockAlert)
    {
        $this->stockAlert = $stockAlert;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('user.' . $this->stockAlert->user_id);
    }
    
    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith()
    {
        $product = $this->stockAlert->product;
        $storeIntegration = $product->storeIntegration;
        
        return [
            'id' => $this->stockAlert->id,
            'product' => [
                'id' => $product->id,
                'title' => $product->title,
                'sku' => $product->sku,
                'quantity' => $product->quantity,
                'image_url' => $product->image_url,
            ],
            'threshold' => $this->stockAlert->threshold,
            'triggered_at' => $this->stockAlert->triggered_at,
            'store' => [
                'id' => $storeIntegration->id,
                'name' => $storeIntegration->name,
                'platform' => $storeIntegration->platform,
            ],
        ];
    }
    
    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'stock.alert.triggered';
    }
}
