<?php

namespace App\Http\Controllers;

use App\Models\StoreIntegration;
use App\Services\InventorySyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class StoreIntegrationController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $this->authorize('view store integrations');
        
        // For admin users, show all integrations
        // For store managers, only show their own integrations
        $integrations = Auth::user()->hasRole('admin')
            ? StoreIntegration::with('user:id,name')->latest()->get()
            : Auth::user()->storeIntegrations()->latest()->get();
            
        return Inertia::render('StoreIntegrations/Index', [
            'integrations' => $integrations,
            'can' => [
                'create_integration' => Auth::user()->can('create store integrations'),
                'edit_integration' => Auth::user()->can('edit store integrations'),
                'delete_integration' => Auth::user()->can('delete store integrations'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        $this->authorize('create store integrations');
        
        return Inertia::render('StoreIntegrations/Create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $this->authorize('create store integrations');
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'platform' => ['required', Rule::in(['shopify', 'etsy', 'amazon'])],
            'shop_url' => 'nullable|string|max:255',
            'api_key' => 'nullable|string|max:255',
            'api_secret' => 'nullable|string|max:255',
            'access_token' => 'nullable|string',
            'refresh_token' => 'nullable|string',
            'token_expires_at' => 'nullable|date',
            'additional_data' => 'nullable|array',
            'is_active' => 'boolean',
        ]);
        
        // Associate with the current user
        $validated['user_id'] = Auth::id();
        
        // Create the integration
        StoreIntegration::create($validated);
        
        return redirect()->route('store-integrations.index')
            ->with('success', 'Store integration created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\StoreIntegration  $storeIntegration
     * @return \Inertia\Response
     */
    public function show(StoreIntegration $storeIntegration)
    {
        $this->authorize('view store integrations');
        
        // Check if user has access to this integration
        if (!Auth::user()->hasRole('admin') && $storeIntegration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Load related products with pagination
        $storeIntegration->load(['products' => function ($query) {
            $query->latest()->take(10);
        }]);
        
        // Get last sync
        $lastSync = $storeIntegration->syncLogs()->latest()->first();
        
        return Inertia::render('StoreIntegrations/Show', [
            'storeIntegration' => $storeIntegration,
            'lastSync' => $lastSync,
            'can' => [
                'edit_integration' => Auth::user()->can('edit store integrations'),
                'delete_integration' => Auth::user()->can('delete store integrations'),
                'sync_products' => Auth::user()->can('sync products'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\StoreIntegration  $storeIntegration
     * @return \Inertia\Response
     */
    public function edit(StoreIntegration $storeIntegration)
    {
        $this->authorize('edit store integrations');
        
        // Check if user has access to this integration
        if (!Auth::user()->hasRole('admin') && $storeIntegration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        return Inertia::render('StoreIntegrations/Edit', [
            'storeIntegration' => $storeIntegration
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\StoreIntegration  $storeIntegration
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, StoreIntegration $storeIntegration)
    {
        $this->authorize('edit store integrations');
        
        // Check if user has access to this integration
        if (!Auth::user()->hasRole('admin') && $storeIntegration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'platform' => ['required', Rule::in(['shopify', 'etsy', 'amazon'])],
            'shop_url' => 'nullable|string|max:255',
            'api_key' => 'nullable|string|max:255',
            'api_secret' => 'nullable|string|max:255',
            'access_token' => 'nullable|string',
            'refresh_token' => 'nullable|string',
            'token_expires_at' => 'nullable|date',
            'additional_data' => 'nullable|array',
            'is_active' => 'boolean',
        ]);
        
        $storeIntegration->update($validated);
        
        return redirect()->route('store-integrations.show', $storeIntegration)
            ->with('success', 'Store integration updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\StoreIntegration  $storeIntegration
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(StoreIntegration $storeIntegration)
    {
        $this->authorize('delete store integrations');
        
        // Check if user has access to this integration
        if (!Auth::user()->hasRole('admin') && $storeIntegration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $storeIntegration->delete();
        
        return redirect()->route('store-integrations.index')
            ->with('success', 'Store integration deleted successfully.');
    }
    
    /**
     * Sync products for the specified integration.
     *
     * @param  \App\Models\StoreIntegration  $storeIntegration
     * @param  \App\Services\InventorySyncService  $syncService
     * @return \Illuminate\Http\RedirectResponse
     */
    public function sync(StoreIntegration $storeIntegration, InventorySyncService $syncService)
    {
        $this->authorize('sync products');
        
        // Check if user has access to this integration
        if (!Auth::user()->hasRole('admin') && $storeIntegration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Check if integration is active
        if (!$storeIntegration->is_active) {
            return redirect()->route('store-integrations.show', $storeIntegration)
                ->with('error', 'Cannot sync products: Store integration is not active.');
        }
        
        // Perform the sync using the service
        $result = $syncService->syncAllProducts($storeIntegration);
        
        if ($result['success']) {
            return redirect()->route('store-integrations.show', $storeIntegration)
                ->with('success', 'Products synced successfully. ' . 
                    ($result['data']['created'] ?? 0) . ' created, ' . 
                    ($result['data']['updated'] ?? 0) . ' updated, ' . 
                    ($result['data']['skipped'] ?? 0) . ' unchanged.');
        } else {
            return redirect()->route('store-integrations.show', $storeIntegration)
                ->with('error', 'Sync failed: ' . ($result['error'] ?? 'Unknown error'));
        }
    }
}
