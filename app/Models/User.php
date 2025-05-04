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

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
    
    /**
     * Get the store integrations associated with the user.
     */
    public function storeIntegrations()
    {
        return $this->hasMany(StoreIntegration::class);
    }
    
    /**
     * Get the stock alerts associated with the user.
     */
    public function stockAlerts()
    {
        return $this->hasMany(StockAlert::class);
    }
    
    /**
     * Check if the user has access to the given store integration
     *
     * @param StoreIntegration $storeIntegration
     * @return bool
     */
    public function hasAccessToStore(StoreIntegration $storeIntegration)
    {
        return $this->id === $storeIntegration->user_id || 
               $this->hasRole('admin');
    }
}
