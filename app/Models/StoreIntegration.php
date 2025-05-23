<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreIntegration extends Model
{
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
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
     */
    protected $casts = [
        'additional_data' => 'array',
        'is_active' => 'boolean',
        'token_expires_at' => 'datetime',
        'last_sync_at' => 'datetime',
    ];
    
    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'api_secret',
        'access_token',
        'refresh_token',
    ];
    
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function products()
    {
        return $this->hasMany(Product::class);
    }
    
    public function syncLogs()
    {
        return $this->hasMany(InventorySyncLog::class);
    }
    
    public function hasTokenExpired()
    {
        if (!$this->token_expires_at) {
            return false;
        }
        
        return now()->gt($this->token_expires_at);
    }
}

