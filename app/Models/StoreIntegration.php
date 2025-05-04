<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreIntegration extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'platform',
        'shop_url',
        'api_key',
        'api_secret',
        'access_token',
        'refresh_token',
        'token_expires_at',
        'additional_data',
        'is_active',
        'last_sync_at',
    ];
    
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'additional_data' => 'array',
        'is_active' => 'boolean',
        'token_expires_at' => 'datetime',
        'last_sync_at' => 'datetime',
    ];
    
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'api_secret',
        'access_token',
        'refresh_token',
    ];
    
    /**
     * Get the user that owns the store integration.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    /**
     * Get the products for the store integration.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }
    
    /**
     * Get the inventory sync logs for the store integration.
     */
    public function syncLogs()
    {
        return $this->hasMany(InventorySyncLog::class);
    }
    
    /**
     * Check if the integration token has expired
     *
     * @return bool
     */
    public function hasTokenExpired()
    {
        if (!$this->token_expires_at) {
            return false;
        }
        
        return now()->gt($this->token_expires_at);
    }
}
