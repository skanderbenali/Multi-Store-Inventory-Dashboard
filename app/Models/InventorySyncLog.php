<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventorySyncLog extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
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
     *
     * @var array<string, string>
     */
    protected $casts = [
        'details' => 'array',
        'products_synced' => 'integer',
        'products_failed' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];
    
    /**
     * Get the store integration that owns the sync log.
     */
    public function storeIntegration()
    {
        return $this->belongsTo(StoreIntegration::class);
    }
    
    /**
     * Get the product that was synced, if applicable.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    
    /**
     * Scope a query to only include failed syncs.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }
    
    /**
     * Scope a query to only include completed syncs.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
    
    /**
     * Calculate the duration of the sync in seconds
     *
     * @return int|null
     */
    public function getDurationInSecondsAttribute()
    {
        if (!$this->started_at || !$this->completed_at) {
            return null;
        }
        
        return $this->started_at->diffInSeconds($this->completed_at);
    }
}
