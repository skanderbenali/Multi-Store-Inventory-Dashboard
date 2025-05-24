<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockAlert;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class StockAlertController extends Controller
{
    
    public function index(Request $request)
    {
        try {
            $this->authorize('view stock alerts');
            
            $query = Auth::user()->hasRole('admin')
                ? StockAlert::with(['product.storeIntegration', 'user'])
                : Auth::user()->stockAlerts()->with(['product.storeIntegration']);
                
            
            if ($request->has('filter')) {
                
                if ($request->filled('filter.status')) {
                    $query->where('status', $request->input('filter.status'));
                }
                
                if ($request->filled('filter.notification_method')) {
                    $query->where('notification_method', $request->input('filter.notification_method'));
                }
                
                if ($request->has('filter.is_active')) {
                    $query->where('is_active', (bool) $request->input('filter.is_active'));
                }
            }
            
            $alerts = $query->latest()->paginate(10)
                ->appends($request->query());
                
            // Get products for the filter dropdown
            $productsQuery = Product::with('storeIntegration');
            
            if (!Auth::user()->hasRole('admin')) {
                $userIntegrationIds = Auth::user()->storeIntegrations()->pluck('id');
                $productsQuery->whereHas('storeIntegration', function($q) use ($userIntegrationIds) {
                    $q->whereIn('id', $userIntegrationIds);
                });
            }
            
            $products = $productsQuery->get();
            
            return Inertia::render('StockAlerts/Index', [
                'alerts' => $alerts,
                'products' => $products,
                'filters' => $request->only(['filter']),
                'can' => [
                    'create_alert' => Auth::user()->can('create stock alerts'),
                    'edit_alert' => Auth::user()->can('edit stock alerts'),
                    'delete_alert' => Auth::user()->can('delete stock alerts'),
                ],
                'flash' => [
                    'success' => session('success')
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in StockAlertController@index: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);
            
            return back()->with('error', 'An error occurred while loading stock alerts.');
        }
    }

   
    public function create(Request $request)
    {
        try {
            $this->authorize('create stock alerts');
            
            $productId = $request->input('product_id');
            $preselectedProduct = null;
            
            if ($productId) {
                $preselectedProduct = Product::with('storeIntegration')->findOrFail($productId);
                $integration = $preselectedProduct->storeIntegration;
                if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
                    abort(403, 'Unauthorized action.');
                }
            }
            
            // Get all products the user has access to
            $query = Product::with('storeIntegration');
            
            if (!Auth::user()->hasRole('admin')) {
                $userIntegrationIds = Auth::user()->storeIntegrations()->pluck('id');
                $query->whereHas('storeIntegration', function($q) use ($userIntegrationIds) {
                    $q->whereIn('id', $userIntegrationIds);
                });
            }
            
            $products = $query->get();
            
            return Inertia::render('StockAlerts/Create', [
                'products' => $products,
                'preselectedProduct' => $productId,
                'notificationMethods' => [
                    ['value' => 'email', 'label' => 'Email'],
                    ['value' => 'in_app', 'label' => 'In-App Notification'],
                    ['value' => 'slack', 'label' => 'Slack'],
                    ['value' => 'discord', 'label' => 'Discord'],
                ],
                'can' => [
                    'create_alert' => Auth::user()->can('create stock alerts'),
                    'edit_alert' => Auth::user()->can('edit stock alerts'),
                    'delete_alert' => Auth::user()->can('delete stock alerts'),
                ],
                'flash' => [
                    'success' => session('success')
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in StockAlertController@create: ' . $e->getMessage(), [
                'exception' => $e,
                'request' => $request->all()
            ]);
            
            return back()->with('error', 'An error occurred while loading the create alert form.');
        }
    }

    
    public function store(Request $request)
    {
        $this->authorize('create stock alerts');
        
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'threshold' => 'required|integer|min:1',
            'notification_method' => 'required|in:email,in_app,slack,discord',
            'is_active' => 'boolean',
        ]);
        
        // Verify user has access to this product
        $product = Product::with('storeIntegration')->findOrFail($validated['product_id']);
        $integration = $product->storeIntegration;
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        $validated['user_id'] = Auth::id();
        if ($product->quantity <= $validated['threshold']) {
            $validated['status'] = 'triggered';
            $validated['triggered_at'] = now();
        } else {
            $validated['status'] = 'pending';
        }
        $alert = StockAlert::create($validated);
        
        return redirect()->route('products.show', $product)
            ->with('success', 'Stock alert created successfully.');
    }

    public function show(StockAlert $stockAlert)
    {
        $this->authorize('view stock alerts');
        if (!Auth::user()->hasRole('admin') && $stockAlert->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        $stockAlert->load(['product.storeIntegration', 'user']);
        
        return Inertia::render('StockAlerts/Show', [
            'alert' => $stockAlert,
            'can' => [
                'edit_alert' => Auth::user()->can('edit stock alerts'),
                'delete_alert' => Auth::user()->can('delete stock alerts'),
            ]
        ]);
    }

    public function edit(StockAlert $stockAlert)
    {
        try {
            $this->authorize('edit stock alerts');
            if (!Auth::user()->hasRole('admin') && $stockAlert->user_id !== Auth::id()) {
                abort(403, 'Unauthorized action.');
            }
            $stockAlert->load('product.storeIntegration');
            
            // Get all products the user has access to for reference
            $query = Product::with('storeIntegration');
            
            if (!Auth::user()->hasRole('admin')) {
                $userIntegrationIds = Auth::user()->storeIntegrations()->pluck('id');
                $query->whereHas('storeIntegration', function($q) use ($userIntegrationIds) {
                    $q->whereIn('id', $userIntegrationIds);
                });
            }
            
            $products = $query->get();
            
            return Inertia::render('StockAlerts/Edit', [
                'alert' => $stockAlert,
                'products' => $products,
                'notificationMethods' => [
                    ['value' => 'email', 'label' => 'Email'],
                    ['value' => 'in_app', 'label' => 'In-App Notification'],
                    ['value' => 'slack', 'label' => 'Slack'],
                    ['value' => 'discord', 'label' => 'Discord'],
                ],
                'can' => [
                    'create_alert' => Auth::user()->can('create stock alerts'),
                    'edit_alert' => Auth::user()->can('edit stock alerts'),
                    'delete_alert' => Auth::user()->can('delete stock alerts'),
                ],
                'flash' => [
                    'success' => session('success')
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error in StockAlertController@edit: ' . $e->getMessage(), [
                'exception' => $e,
                'alert_id' => $stockAlert->id
            ]);
            
            return back()->with('error', 'An error occurred while loading the edit alert form.');
        }
    }

    public function update(Request $request, StockAlert $stockAlert)
    {
        $this->authorize('edit stock alerts');
        if (!Auth::user()->hasRole('admin') && $stockAlert->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $validated = $request->validate([
            'threshold' => 'required|integer|min:1',
            'notification_method' => 'required|in:email,in_app,slack,discord',
            'is_active' => 'boolean',
        ]);
        $product = $stockAlert->product;
        
        // If threshold changed, we need to re-evaluate status
        if ($stockAlert->threshold != $validated['threshold']) {
            if ($product->quantity <= $validated['threshold'] && $stockAlert->status !== 'triggered') {
                $validated['status'] = 'triggered';
                $validated['triggered_at'] = now();
            } elseif ($product->quantity > $validated['threshold'] && $stockAlert->status === 'triggered') {
                $validated['status'] = 'resolved';
                $validated['resolved_at'] = now();
            }
        }
        $stockAlert->update($validated);
        
        return redirect()->route('stock-alerts.show', $stockAlert)
            ->with('success', 'Stock alert updated successfully.');
    }

   
    public function destroy(StockAlert $stockAlert)
    {
        $this->authorize('delete stock alerts');
        if (!Auth::user()->hasRole('admin') && $stockAlert->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $productId = $stockAlert->product_id;
        $stockAlert->delete();
        
        // If we came from a product page, return there, otherwise go to alerts list
        if (url()->previous() === route('products.show', $productId)) {
            return redirect()->route('products.show', $productId)
                ->with('success', 'Stock alert deleted successfully.');
        }
        
        return redirect()->route('stock-alerts.index')
            ->with('success', 'Stock alert deleted successfully.');
    }
    

    public function toggleActive(StockAlert $stockAlert)
    {
        $this->authorize('edit stock alerts');
        if (!Auth::user()->hasRole('admin') && $stockAlert->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $stockAlert->update([
            'is_active' => !$stockAlert->is_active,
        ]);
        
        return redirect()->back()
            ->with('success', 'Alert ' . ($stockAlert->is_active ? 'activated' : 'deactivated') . ' successfully.');
    }
}

