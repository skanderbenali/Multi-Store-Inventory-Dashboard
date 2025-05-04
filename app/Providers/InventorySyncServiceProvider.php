<?php

namespace App\Providers;

use App\Services\InventorySyncService;
use Illuminate\Support\ServiceProvider;

class InventorySyncServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton(InventorySyncService::class, function ($app) {
            return new InventorySyncService();
        });
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
