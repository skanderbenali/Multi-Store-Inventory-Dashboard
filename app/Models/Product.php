<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
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
    
    
    public function storeIntegration()
    {
        return $this->belongsTo(StoreIntegration::class);
    }
    
   
    public function stockAlerts()
    {
        return $this->hasMany(StockAlert::class);
    }
    
    
    public function syncLogs()
    {
        return $this->hasMany(InventorySyncLog::class);
    }
    
    
    public function isLowStock()
    {
        return $this->quantity <= $this->low_stock_threshold;
    }
    
    
    public function isOutOfStock()
    {
        return $this->quantity <= 0;
    }
    

    public function scopeLowStock($query)
    {
        return $query->whereRaw('quantity <= low_stock_threshold AND quantity > 0');
    }
    
    public function scopeOutOfStock($query)
    {
        return $query->where('quantity', '<=', 0);
    }
}

