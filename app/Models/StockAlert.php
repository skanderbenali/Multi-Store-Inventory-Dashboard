<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockAlert extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'user_id',
        'threshold',
        'status',
        'notification_method',
        'is_active',
        'triggered_at',
        'resolved_at',
        'notified_at',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'threshold' => 'integer',
        'is_active' => 'boolean',
        'triggered_at' => 'datetime',
        'resolved_at' => 'datetime',
        'notified_at' => 'datetime',
    ];
    
    /**
     * Get the product that the alert is for.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    
    /**
     * Get the user that should be notified.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Scope a query to only include active alerts.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    /**
     * Scope a query to only include triggered alerts.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeTriggered($query)
    {
        return $query->where('status', 'triggered');
    }
    
    /**
     * Scope a query to only include alerts that have not been notified yet.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeNotNotified($query)
    {
        return $query->whereNull('notified_at')->orWhere('notified_at', '<', now()->subDay());
    }
}
