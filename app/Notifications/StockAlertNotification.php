<?php

namespace App\Notifications;

use App\Models\StockAlert;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StockAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The stock alert instance.
     *
     * @var \App\Models\StockAlert
     */
    protected $stockAlert;

    /**
     * Create a new notification instance.
     *
     * @param  \App\Models\StockAlert  $stockAlert
     * @return void
     */
    public function __construct(StockAlert $stockAlert)
    {
        $this->stockAlert = $stockAlert;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    public function toMail($notifiable)
    {
        $product = $this->stockAlert->product;
        $storeIntegration = $product->storeIntegration;
        
        return (new MailMessage)
            ->subject('⚠️ Low Stock Alert: ' . $product->title)
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('One of your products has reached its low stock threshold:')
            ->line('**Product:** ' . $product->title)
            ->line('**SKU:** ' . $product->sku)
            ->line('**Current Stock:** ' . $product->quantity)
            ->line('**Threshold:** ' . $this->stockAlert->threshold)
            ->line('**Store:** ' . $storeIntegration->name . ' (' . $storeIntegration->platform . ')')
            ->action('View Product', url('/products/' . $product->id))
            ->line('Thank you for using our inventory management system!')
            ->salutation('Regards, Multi-Store Inventory Dashboard');
    }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        $product = $this->stockAlert->product;
        $storeIntegration = $product->storeIntegration;
        
        return [
            'stock_alert_id' => $this->stockAlert->id,
            'product_id' => $product->id,
            'product_title' => $product->title,
            'product_sku' => $product->sku,
            'current_quantity' => $product->quantity,
            'threshold' => $this->stockAlert->threshold,
            'store_integration_id' => $storeIntegration->id,
            'store_name' => $storeIntegration->name,
            'platform' => $storeIntegration->platform,
        ];
    }
}
