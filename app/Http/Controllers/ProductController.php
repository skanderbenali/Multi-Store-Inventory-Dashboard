<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StoreIntegration;
use App\Services\InventorySyncService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $this->authorize('view products');
        
        // Get integrations the user has access to
        $integrationIds = Auth::user()->hasRole('admin')
            ? StoreIntegration::pluck('id')
            : Auth::user()->storeIntegrations()->pluck('id');
            
        // Base query for products the user has access to
        $query = Product::with('storeIntegration')
            ->whereIn('store_integration_id', $integrationIds);
        
        // Apply filters if provided
        if ($request->has('filter')) {
            // Filter by integration ID
            if ($request->filled('filter.integration')) {
                $integrationId = $request->input('filter.integration');
                // Verify user has access to this integration
                if (in_array($integrationId, $integrationIds->toArray())) {
                    $query->where('store_integration_id', $integrationId);
                }
            }
            
            // Filter by stock level
            if ($request->filled('filter.stock_level')) {
                switch ($request->input('filter.stock_level')) {
                    case 'low':
                        $query->lowStock();
                        break;
                    case 'out':
                        $query->outOfStock();
                        break;
                }
            }
            
            // Filter by SKU
            if ($request->filled('filter.sku')) {
                $query->where('sku', 'like', '%' . $request->input('filter.sku') . '%');
            }
        }
        
        // Search by keyword if provided
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($query) use ($search) {
                $query->where('title', 'like', '%' . $search . '%')
                    ->orWhere('sku', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }
        
        // Paginate the results
        $products = $query->latest('last_sync_at')->paginate(10)
            ->appends($request->query());
        
        // Get store integrations for filtering
        $integrations = StoreIntegration::whereIn('id', $integrationIds)
            ->select('id', 'name', 'platform')
            ->get();
        
        // Get sync suggestions (products out of stock in one store but available in others)
        $syncSuggestions = [];
        
        if (Auth::user()->can('sync products')) {
            $syncSuggestions = Product::join('products as p2', function ($join) {
                $join->on('products.sku', '=', 'p2.sku')
                    ->where('products.store_integration_id', '<>', 'p2.store_integration_id');
            })
            ->where('products.quantity', '<=', 0)
            ->where('p2.quantity', '>', 0)
            ->select('products.*', 'p2.quantity as other_quantity', 'p2.store_integration_id as other_store_id')
            ->with(['storeIntegration:id,name', 'storeIntegration.user:id,name'])
            ->limit(5)
            ->get();
        }
        
        return Inertia::render('Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'filter']),
            'integrations' => $integrations,
            'syncSuggestions' => $syncSuggestions,
            'can' => [
                'create_product' => Auth::user()->can('create products'),
                'edit_product' => Auth::user()->can('edit products'),
                'delete_product' => Auth::user()->can('delete products'),
                'sync_products' => Auth::user()->can('sync products'),
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
        $this->authorize('create products');
        
        // Get store integrations the user has access to
        $integrations = Auth::user()->hasRole('admin')
            ? StoreIntegration::select('id', 'name', 'platform')->get()
            : Auth::user()->storeIntegrations()->select('id', 'name', 'platform')->get();
            
        return Inertia::render('Products/Create', [
            'integrations' => $integrations
        ]);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        $this->authorize('create products');
        
        $validated = $request->validate([
            'store_integration_id' => 'required|exists:store_integrations,id',
            'title' => 'required|string|max:255',
            'sku' => 'required|string|max:100',
            'platform_product_id' => 'nullable|string|max:100',
            'quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'variants' => 'nullable|array',
            'additional_data' => 'nullable|array',
        ]);
        
        // Verify user has access to this integration
        $integration = StoreIntegration::findOrFail($validated['store_integration_id']);
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Check if product with this SKU already exists for this integration
        $existingProduct = Product::where('sku', $validated['sku'])
            ->where('store_integration_id', $validated['store_integration_id'])
            ->first();
            
        if ($existingProduct) {
            return redirect()->back()
                ->withErrors(['sku' => 'A product with this SKU already exists for this store.']);
        }
        
        // Set last sync time
        $validated['last_sync_at'] = now();
        
        // Create the product
        $product = Product::create($validated);
        
        return redirect()->route('products.show', $product)
            ->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Product  $product
     * @return \Inertia\Response
     */
    public function show(Product $product)
    {
        $this->authorize('view products');
        
        // Check if user has access to this product's integration
        $integration = $product->storeIntegration;
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Load store integration and alerts
        $product->load(['storeIntegration', 'stockAlerts']);
        
        // Find similar products (same SKU) in other stores
        $similarProducts = Product::where('sku', $product->sku)
            ->where('id', '!=', $product->id)
            ->with('storeIntegration:id,name,platform')
            ->get();
        
        // Get sync logs for this product
        $syncLogs = $product->syncLogs()->latest()->take(5)->get();
        
        return Inertia::render('Products/Show', [
            'product' => $product,
            'similarProducts' => $similarProducts,
            'syncLogs' => $syncLogs,
            'can' => [
                'edit_product' => Auth::user()->can('edit products'),
                'delete_product' => Auth::user()->can('delete products'),
                'create_alert' => Auth::user()->can('create stock alerts'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Product  $product
     * @return \Inertia\Response
     */
    public function edit(Product $product)
    {
        $this->authorize('edit products');
        
        // Check if user has access to this product's integration
        $integration = $product->storeIntegration;
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        return Inertia::render('Products/Edit', [
            'product' => $product,
            'storeIntegration' => $product->storeIntegration()->select('id', 'name', 'platform')->first()
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Product $product)
    {
        $this->authorize('edit products');
        
        // Check if user has access to this product's integration
        $integration = $product->storeIntegration;
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'sku' => 'required|string|max:100',
            'platform_product_id' => 'nullable|string|max:100',
            'quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'required|integer|min:0',
            'price' => 'nullable|numeric|min:0',
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'variants' => 'nullable|array',
            'additional_data' => 'nullable|array',
        ]);
        
        // Check if changing SKU would conflict with another product
        if ($validated['sku'] !== $product->sku) {
            $existingProduct = Product::where('sku', $validated['sku'])
                ->where('store_integration_id', $product->store_integration_id)
                ->where('id', '!=', $product->id)
                ->first();
                
            if ($existingProduct) {
                return redirect()->back()
                    ->withErrors(['sku' => 'A product with this SKU already exists for this store.']);
            }
        }
        
        $product->update($validated);
        
        return redirect()->route('products.show', $product)
            ->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Product $product)
    {
        $this->authorize('delete products');
        
        // Check if user has access to this product's integration
        $integration = $product->storeIntegration;
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $product->delete();
        
        return redirect()->route('products.index')
            ->with('success', 'Product deleted successfully.');
    }
    
    /**
     * Update stock quantity for a product.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @param  \App\Services\InventorySyncService  $syncService
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateStock(Request $request, Product $product, InventorySyncService $syncService)
    {
        $this->authorize('edit products');
        
        // Check if user has access to this product's integration
        $integration = $product->storeIntegration;
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'push_to_platform' => 'boolean',
        ]);
        
        $quantity = $validated['quantity'];
        $shouldPushToPlatform = $request->has('push_to_platform') ? $validated['push_to_platform'] : false;
        
        if ($shouldPushToPlatform && $integration->is_active) {
            // Push inventory update to the platform
            $result = $syncService->pushInventoryUpdate($product, $quantity);
            
            if (!$result['success']) {
                return redirect()->back()
                    ->with('error', 'Failed to update inventory on platform: ' . ($result['error'] ?? 'Unknown error'));
            }
            
            // Product quantity is already updated by the sync service
            $message = 'Stock updated and synced with platform successfully.';
        } else {
            // Just update the local product quantity
            $product->update([
                'quantity' => $quantity,
                'last_sync_at' => now(),
            ]);
            
            $message = 'Stock updated successfully.';
        }
        
        // Check for stock alerts
        $syncService->checkProductStockAlerts($product);
        
        return redirect()->back()
            ->with('success', $message);
    }
    
    /**
     * Sync a single product with its platform.
     *
     * @param  \App\Models\Product  $product
     * @param  \App\Services\InventorySyncService  $syncService
     * @return \Illuminate\Http\RedirectResponse
     */
    public function syncProduct(Product $product, InventorySyncService $syncService)
    {
        $this->authorize('sync products');
        
        // Check if user has access to this product's integration
        $integration = $product->storeIntegration;
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Check if integration is active
        if (!$integration->is_active) {
            return redirect()->back()
                ->with('error', 'Cannot sync product: Store integration is not active.');
        }
        
        // Perform the sync
        $result = $syncService->syncProduct($product);
        
        if ($result['success']) {
            return redirect()->back()
                ->with('success', 'Product synced successfully. Status: ' . ($result['data']['status'] ?? 'updated'));
        } else {
            return redirect()->back()
                ->with('error', 'Sync failed: ' . ($result['error'] ?? 'Unknown error'));
        }
    }
}
