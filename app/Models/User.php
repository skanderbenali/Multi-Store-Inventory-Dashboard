<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    
    protected $hidden = [
        'password',
        'remember_token',
    ];

    
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    
    
    public function storeIntegrations()
    {
        return $this->hasMany(StoreIntegration::class);
    }
    
    
    public function stockAlerts()
    {
        return $this->hasMany(StockAlert::class);
    }
    
    
    public function hasAccessToStore(StoreIntegration $storeIntegration)
    {
        return $this->id === $storeIntegration->user_id || 
               $this->hasRole('admin');
    }
}

