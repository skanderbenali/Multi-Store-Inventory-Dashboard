<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoreIntegrationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockAlertController;
use App\Http\Controllers\InventorySyncLogController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    Route::resource('store-integrations', StoreIntegrationController::class);
    Route::post('store-integrations/{storeIntegration}/sync', [StoreIntegrationController::class, 'sync'])
        ->name('store-integrations.sync');
    
    Route::resource('products', ProductController::class);
    Route::patch('products/{product}/update-stock', [ProductController::class, 'updateStock'])
        ->name('products.update-stock');
    Route::post('products/{product}/sync', [ProductController::class, 'syncProduct'])
        ->name('products.sync');
    
    Route::resource('stock-alerts', StockAlertController::class);
    Route::patch('stock-alerts/{stockAlert}/toggle-active', [StockAlertController::class, 'toggleActive'])
        ->name('stock-alerts.toggle-active');
    
    Route::resource('inventory-sync-logs', InventorySyncLogController::class);
    Route::get('sync-dashboard', [InventorySyncLogController::class, 'dashboard'])
        ->name('inventory-sync-logs.dashboard');
});

require __DIR__.'/auth.php';
