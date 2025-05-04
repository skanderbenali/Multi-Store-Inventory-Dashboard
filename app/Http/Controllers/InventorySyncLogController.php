<?php

namespace App\Http\Controllers;

use App\Models\InventorySyncLog;
use App\Models\StoreIntegration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InventorySyncLogController extends Controller
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
        
        // Get store integrations the user has access to
        $integrationIds = Auth::user()->hasRole('admin')
            ? StoreIntegration::pluck('id')
            : Auth::user()->storeIntegrations()->pluck('id');
            
        // Base query for sync logs the user has access to
        $query = InventorySyncLog::with(['storeIntegration', 'product'])
            ->whereIn('store_integration_id', $integrationIds);
        
        // Apply filters if provided
        if ($request->has('filter')) {
            // Filter by store integration
            if ($request->filled('filter.integration')) {
                $integrationId = $request->input('filter.integration');
                // Verify user has access to this integration
                if (in_array($integrationId, $integrationIds->toArray())) {
                    $query->where('store_integration_id', $integrationId);
                }
            }
            
            // Filter by sync status
            if ($request->filled('filter.status')) {
                $query->where('status', $request->input('filter.status'));
            }
            
            // Filter by sync type
            if ($request->filled('filter.sync_type')) {
                $query->where('sync_type', $request->input('filter.sync_type'));
            }
            
            // Filter by date range
            if ($request->filled('filter.start_date')) {
                $query->whereDate('created_at', '>=', $request->input('filter.start_date'));
            }
            
            if ($request->filled('filter.end_date')) {
                $query->whereDate('created_at', '<=', $request->input('filter.end_date'));
            }
        }
        
        // Paginate the results
        $syncLogs = $query->latest()->paginate(15)
            ->appends($request->query());
        
        // Get store integrations for filtering
        $integrations = StoreIntegration::whereIn('id', $integrationIds)
            ->select('id', 'name', 'platform')
            ->get();
        
        // Summary statistics
        $stats = [
            'total' => $query->count(),
            'completed' => $query->where('status', 'completed')->count(),
            'failed' => $query->where('status', 'failed')->count(),
            'in_progress' => $query->where('status', 'in_progress')->count(),
            'pending' => $query->where('status', 'pending')->count(),
        ];
        
        return Inertia::render('InventorySyncLogs/Index', [
            'syncLogs' => $syncLogs,
            'filters' => $request->only(['filter']),
            'integrations' => $integrations,
            'stats' => $stats,
            'can' => [
                'sync_products' => Auth::user()->can('sync products'),
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     * Not used directly - syncs are initiated from store integrations
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function create()
    {
        return redirect()->route('inventory-sync-logs.index');
    }

    /**
     * Store a newly created resource in storage.
     * Not used directly - syncs are created via jobs
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        return redirect()->route('inventory-sync-logs.index');
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\InventorySyncLog  $inventorySyncLog
     * @return \Inertia\Response
     */
    public function show(InventorySyncLog $inventorySyncLog)
    {
        $this->authorize('view products');
        
        // Check if user has access to this sync log's integration
        $integration = $inventorySyncLog->storeIntegration;
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        // Load related data
        $inventorySyncLog->load([
            'storeIntegration',
            'product',
        ]);
        
        return Inertia::render('InventorySyncLogs/Show', [
            'syncLog' => $inventorySyncLog,
            'can' => [
                'sync_products' => Auth::user()->can('sync products'),
            ]
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     * Not used - sync logs are not editable
     *
     * @param  \App\Models\InventorySyncLog  $inventorySyncLog
     * @return \Illuminate\Http\RedirectResponse
     */
    public function edit(InventorySyncLog $inventorySyncLog)
    {
        return redirect()->route('inventory-sync-logs.show', $inventorySyncLog);
    }

    /**
     * Update the specified resource in storage.
     * Not used - sync logs are updated by background jobs
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\InventorySyncLog  $inventorySyncLog
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, InventorySyncLog $inventorySyncLog)
    {
        return redirect()->route('inventory-sync-logs.show', $inventorySyncLog);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\InventorySyncLog  $inventorySyncLog
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(InventorySyncLog $inventorySyncLog)
    {
        $this->authorize('delete products');
        
        // Check if user has access to this sync log's integration
        $integration = $inventorySyncLog->storeIntegration;
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $inventorySyncLog->delete();
        
        return redirect()->route('inventory-sync-logs.index')
            ->with('success', 'Sync log deleted successfully.');
    }
    
    /**
     * Display a dashboard of sync statistics.
     *
     * @return \Inertia\Response
     */
    public function dashboard()
    {
        $this->authorize('view products');
        
        // Get store integrations the user has access to
        $integrationIds = Auth::user()->hasRole('admin')
            ? StoreIntegration::pluck('id')
            : Auth::user()->storeIntegrations()->pluck('id');
        
        // Get sync statistics
        $stats = [
            'total_syncs' => InventorySyncLog::whereIn('store_integration_id', $integrationIds)->count(),
            'successful_syncs' => InventorySyncLog::whereIn('store_integration_id', $integrationIds)
                ->where('status', 'completed')
                ->count(),
            'failed_syncs' => InventorySyncLog::whereIn('store_integration_id', $integrationIds)
                ->where('status', 'failed')
                ->count(),
            'pending_syncs' => InventorySyncLog::whereIn('store_integration_id', $integrationIds)
                ->whereIn('status', ['pending', 'in_progress'])
                ->count(),
        ];
        
        // Get recent sync logs
        $recentSyncs = InventorySyncLog::whereIn('store_integration_id', $integrationIds)
            ->with(['storeIntegration', 'product'])
            ->latest()
            ->take(5)
            ->get();
        
        // Get syncs by platform
        $syncsByPlatform = InventorySyncLog::join('store_integrations', 'inventory_sync_logs.store_integration_id', '=', 'store_integrations.id')
            ->whereIn('store_integration_id', $integrationIds)
            ->selectRaw('store_integrations.platform, COUNT(*) as count')
            ->groupBy('store_integrations.platform')
            ->get()
            ->pluck('count', 'platform')
            ->toArray();
        
        return Inertia::render('InventorySyncLogs/Dashboard', [
            'stats' => $stats,
            'recentSyncs' => $recentSyncs,
            'syncsByPlatform' => $syncsByPlatform,
        ]);
    }
}
