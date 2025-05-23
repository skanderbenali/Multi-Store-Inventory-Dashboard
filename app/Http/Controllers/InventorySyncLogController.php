<?php

namespace App\Http\Controllers;

use App\Models\InventorySyncLog;
use App\Models\StoreIntegration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class InventorySyncLogController extends Controller
{
    
    public function index(Request $request)
    {
        $this->authorize('view products');
        $integrationIds = Auth::user()->hasRole('admin')
            ? StoreIntegration::pluck('id')
            : Auth::user()->storeIntegrations()->pluck('id');
            
        $query = InventorySyncLog::with(['storeIntegration', 'product'])
            ->whereIn('store_integration_id', $integrationIds);
        
        if ($request->has('filter')) {
            if ($request->filled('filter.integration')) {
                $integrationId = $request->input('filter.integration');
                if (in_array($integrationId, $integrationIds->toArray())) {
                    $query->where('store_integration_id', $integrationId);
                }
            }
            
            if ($request->filled('filter.status')) {
                $query->where('status', $request->input('filter.status'));
            }
            
            if ($request->filled('filter.sync_type')) {
                $query->where('sync_type', $request->input('filter.sync_type'));
            }
            
            if ($request->filled('filter.start_date')) {
                $query->whereDate('created_at', '>=', $request->input('filter.start_date'));
            }
            
            if ($request->filled('filter.end_date')) {
                $query->whereDate('created_at', '<=', $request->input('filter.end_date'));
            }
        }
        
        $syncLogs = $query->latest()->paginate(15)
            ->appends($request->query());
        $integrations = StoreIntegration::whereIn('id', $integrationIds)
            ->select('id', 'name', 'platform')
            ->get();
        
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

    
    public function create()
    {
        return redirect()->route('inventory-sync-logs.index');
    }

    
    public function store(Request $request)
    {
        return redirect()->route('inventory-sync-logs.index');
    }

    
    public function show(InventorySyncLog $inventorySyncLog)
    {
        $this->authorize('view products');
        $integration = $inventorySyncLog->storeIntegration;
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
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

    
    public function edit(InventorySyncLog $inventorySyncLog)
    {
        return redirect()->route('inventory-sync-logs.show', $inventorySyncLog);
    }

    
    public function update(Request $request, InventorySyncLog $inventorySyncLog)
    {
        return redirect()->route('inventory-sync-logs.show', $inventorySyncLog);
    }

   
    public function destroy(InventorySyncLog $inventorySyncLog)
    {
        $this->authorize('delete products');
        $integration = $inventorySyncLog->storeIntegration;
        
        if (!Auth::user()->hasRole('admin') && $integration->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }
        
        $inventorySyncLog->delete();
        
        return redirect()->route('inventory-sync-logs.index')
            ->with('success', 'Sync log deleted successfully.');
    }
    
    
    public function dashboard()
    {
        $this->authorize('view products');
        $integrationIds = Auth::user()->hasRole('admin')
            ? StoreIntegration::pluck('id')
            : Auth::user()->storeIntegrations()->pluck('id');
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
        $recentSyncs = InventorySyncLog::whereIn('store_integration_id', $integrationIds)
            ->with(['storeIntegration', 'product'])
            ->latest()
            ->take(5)
            ->get();
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

