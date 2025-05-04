<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StockAlertController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        $this->authorize('view stock alerts');
        
        // For admin users, show all alerts
        // For regular users, only show their own alerts
        $query = Auth::user()->hasRole('admin')
            ? StockAlert::with(['product.storeIntegration', 'user'])
            : Auth::user()->stockAlerts()->with(['product.storeIntegration']);
            
        // Apply filters if provided
        if ($request->has('filter')) {
            // Filter by alert status
            if ($request->filled('filter.status')) {
                $query->where('status', $request->input('filter.status'));
            }
            
            // Filter by notification method
            if ($request->filled('filter.notification_method')) {
                $query->where('notification_method', $request->input('filter.notification_method'));
            }
            
            // Filter by active/inactive
            if ($request->has('filter.is_active')) {
                $query->where('is_active', (bool) $request->input('filter.is_active'));
            }
        }
        
        // Paginate the results
        $alerts = $query->latest()->paginate(10)
            ->appends($request->query());
        
        return Inertia::render('StockAlerts/Index', [
            'alerts' => $alerts,
            'filters' => $request->only(['filter']),
            'can' => [
                'create_alert' => Auth::user()->can('create stock alerts'),
                'edit_alert' => Auth::user()->can('edit stock alerts'),
                'delete_alert' => Auth::user()->can('delete stock alerts'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Inertia\Response
     */
    public function create(Request $request)
    {
        $this->authorize('create stock alerts');
        
        $productId = $request->input('product_id');
        $product = null;
        
        if ($productId) {
            $product = Product::with('storeIntegration')->findOrFail($productId);
            
            // Check if user has access to this product
            $integration = $product->storeIntegration;
            if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
                abort(403, 'Unauthorized action.');
            }
        }
        
        return Inertia::render('StockAlerts/Create', [
            'product' => $product,
            'notificationMethods' => [
                ['value' => 'email', 'label' => 'Email'],
                ['value' => 'in_app', 'label' => 'In-App Notification'],
                ['value' => 'slack', 'label' => 'Slack'],
                ['value' => 'discord', 'label' => 'Discord'],
            ],
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
        
        // Set user ID and initial status
        $validated['user_id'] = Auth::id();
        
        // Set initial status based on current product quantity
        if ($product->quantity <= $validated['threshold']) {
            $validated['status'] = 'triggered';
            $validated['triggered_at'] = now();
        } else {
            $validated['status'] = 'pending';
        }
        
        // Create the alert
        $alert = StockAlert::create($validated);
        
        return redirect()->route('products.show', $product)
            ->with('success', 'Stock alert created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\StockAlert  $stockAlert
     * @return \Inertia\Response
     */
    public function show(StockAlert $stockAlert)
    {
        $this->authorize('view stock alerts');
        
        // Check if user has access to this alert
        if (!Auth::user()->hasRole('admin') && $stockAlert->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Load relationships
        $stockAlert->load(['product.storeIntegration', 'user']);
        
        return Inertia::render('StockAlerts/Show', [
            'alert' => $stockAlert,
            'can' => [
                'edit_alert' => Auth::user()->can('edit stock alerts'),
                'delete_alert' => Auth::user()->can('delete stock alerts'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\StockAlert  $stockAlert
     * @return \Inertia\Response
     */
    public function edit(StockAlert $stockAlert)
    {
        $this->authorize('edit stock alerts');
        
        // Check if user has access to this alert
        if (!Auth::user()->hasRole('admin') && $stockAlert->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Load product information
        $stockAlert->load('product.storeIntegration');
        
        return Inertia::render('StockAlerts/Edit', [
            'alert' => $stockAlert,
            'notificationMethods' => [
                ['value' => 'email', 'label' => 'Email'],
                ['value' => 'in_app', 'label' => 'In-App Notification'],
                ['value' => 'slack', 'label' => 'Slack'],
                ['value' => 'discord', 'label' => 'Discord'],
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\StockAlert  $stockAlert
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, StockAlert $stockAlert)
    {
        $this->authorize('edit stock alerts');
        
        // Check if user has access to this alert
        if (!Auth::user()->hasRole('admin') && $stockAlert->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $validated = $request->validate([
            'threshold' => 'required|integer|min:1',
            'notification_method' => 'required|in:email,in_app,slack,discord',
            'is_active' => 'boolean',
        ]);
        
        // Get current product quantity to determine status
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
        
        // Update the alert
        $stockAlert->update($validated);
        
        return redirect()->route('stock-alerts.show', $stockAlert)
            ->with('success', 'Stock alert updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\StockAlert  $stockAlert
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(StockAlert $stockAlert)
    {
        $this->authorize('delete stock alerts');
        
        // Check if user has access to this alert
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
    
    /**
     * Toggle the active status of an alert.
     *
     * @param  \App\Models\StockAlert  $stockAlert
     * @return \Illuminate\Http\RedirectResponse
     */
    public function toggleActive(StockAlert $stockAlert)
    {
        $this->authorize('edit stock alerts');
        
        // Check if user has access to this alert
        if (!Auth::user()->hasRole('admin') && $stockAlert->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Toggle the active status
        $stockAlert->update([
            'is_active' => !$stockAlert->is_active,
        ]);
        
        return redirect()->back()
            ->with('success', 'Alert ' . ($stockAlert->is_active ? 'activated' : 'deactivated') . ' successfully.');
    }
}
