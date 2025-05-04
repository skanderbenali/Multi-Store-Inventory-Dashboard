<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'store_integration_id',
        'title',
        'sku',
        'platform_product_id',
        'quantity',
        'low_stock_threshold',
        'price',
        'description',
        'images',
        'variants',
        'additional_data',
        'last_sync_at',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'images' => 'array',
        'variants' => 'array',
        'additional_data' => 'array',
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'low_stock_threshold' => 'integer',
        'last_sync_at' => 'datetime',
    ];
    
    /**
     * Get the store integration that owns the product.
     */
    public function storeIntegration()
    {
        return $this->belongsTo(StoreIntegration::class);
    }
    
    /**
     * Get the stock alerts for the product.
     */
    public function stockAlerts()
    {
        return $this->hasMany(StockAlert::class);
    }
    
    /**
     * Get the inventory sync logs for the product.
     */
    public function syncLogs()
    {
        return $this->hasMany(InventorySyncLog::class);
    }
    
    /**
     * Check if the product is low on stock based on its threshold
     *
     * @return bool
     */
    public function isLowStock()
    {
        return $this->quantity <= $this->low_stock_threshold;
    }
    
    /**
     * Check if the product is out of stock
     *
     * @return bool
     */
    public function isOutOfStock()
    {
        return $this->quantity <= 0;
    }
    
    /**
     * Scope a query to only include products that are low on stock.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeLowStock($query)
    {
        return $query->whereRaw('quantity <= low_stock_threshold AND quantity > 0');
    }
    
    /**
     * Scope a query to only include products that are out of stock.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeOutOfStock($query)
    {
        return $query->where('quantity', '<=', 0);
    }
}
