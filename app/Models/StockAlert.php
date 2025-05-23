<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockAlert extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
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
     */
    protected $casts = [
        'threshold' => 'integer',
        'is_active' => 'boolean',
        'triggered_at' => 'datetime',
        'resolved_at' => 'datetime',
        'notified_at' => 'datetime',
    ];
    
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    
    public function scopeTriggered($query)
    {
        return $query->where('status', 'triggered');
    }
    
    
    public function scopeNotNotified($query)
    {
        return $query->whereNull('notified_at')->orWhere('notified_at', '<', now()->subDay());
    }
}

