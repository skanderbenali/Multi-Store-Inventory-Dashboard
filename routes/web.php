<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StoreIntegrationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\StockAlertController;
use App\Http\Controllers\InventorySyncLogController;
use App\Http\Controllers\DashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Public landing page
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Main dashboard after login
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// Routes protected by authentication
Route::middleware(['auth', 'verified'])->group(function () {
    // User profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Store Integration routes
    Route::resource('store-integrations', StoreIntegrationController::class);
    Route::post('store-integrations/{storeIntegration}/sync', [StoreIntegrationController::class, 'sync'])
        ->name('store-integrations.sync');
    
    // Product routes
    Route::resource('products', ProductController::class);
    Route::patch('products/{product}/update-stock', [ProductController::class, 'updateStock'])
        ->name('products.update-stock');
    Route::post('products/{product}/sync', [ProductController::class, 'syncProduct'])
        ->name('products.sync');
    
    // Stock Alert routes
    Route::resource('stock-alerts', StockAlertController::class);
    Route::patch('stock-alerts/{stockAlert}/toggle-active', [StockAlertController::class, 'toggleActive'])
        ->name('stock-alerts.toggle-active');
    
    // Inventory Sync Log routes
    Route::resource('inventory-sync-logs', InventorySyncLogController::class);
    Route::get('sync-dashboard', [InventorySyncLogController::class, 'dashboard'])
        ->name('inventory-sync-logs.dashboard');
});

require __DIR__.'/auth.php';
