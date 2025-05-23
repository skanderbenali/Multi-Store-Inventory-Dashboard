<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventorySyncLog extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'store_integration_id',
        'product_id',
        'sync_type',
        'status',
        'message',
        'products_synced',
        'products_failed',
        'details',
        'started_at',
        'completed_at',
    ];
    
    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'details' => 'array',
        'products_synced' => 'integer',
        'products_failed' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];
    
    public function storeIntegration()
    {
        return $this->belongsTo(StoreIntegration::class);
    }
    

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    

    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }
    

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
    

    public function getDurationInSecondsAttribute()
    {
        if (!$this->started_at || !$this->completed_at) {
            return null;
        }
        
        return $this->started_at->diffInSeconds($this->completed_at);
    }
}

