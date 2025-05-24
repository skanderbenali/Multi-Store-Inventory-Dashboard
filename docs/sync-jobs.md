# Sync Jobs Documentation

## Overview

The Multi-Store Inventory Dashboard uses a robust synchronization system to keep inventory data up-to-date across multiple e-commerce platforms. This document explains how the synchronization jobs work, how to configure them, and how to troubleshoot common issues.

## Table of Contents

1. [Sync Architecture](#sync-architecture)
2. [Scheduled Jobs](#scheduled-jobs)
3. [Auto-Sync Feature](#auto-sync-feature)
4. [Manual Sync](#manual-sync)
5. [Configuring the Scheduler](#configuring-the-scheduler)
6. [Sync Logs](#sync-logs)
7. [Troubleshooting](#troubleshooting)

## Sync Architecture

The synchronization system is built using Laravel's native task scheduling and job dispatching capabilities. The architecture follows these principles:

- **Non-blocking operations**: Sync jobs run in the background to avoid blocking user interactions
- **Fault tolerance**: Failed syncs are logged and can be retried
- **Platform agnostic**: The same core sync process works for all integrated platforms
- **Resource efficient**: Sync operations use batch processing to minimize API calls

## Scheduled Jobs

The application includes the following scheduled jobs:

### 1. Inventory Sync Job

**Command**: `php artisan inventory:sync-all-stores`  
**Default Schedule**: Every 4 hours  
**Purpose**: Synchronizes product inventory data from all active store integrations  
**Configuration File**: `app/Console/Kernel.php`

### 2. Stock Alert Check Job

**Command**: `php artisan inventory:check-alerts`  
**Default Schedule**: Every hour  
**Purpose**: Checks inventory levels against alert thresholds and sends notifications for low stock  
**Configuration File**: `app/Console/Kernel.php`

## Auto-Sync Feature

The system supports automatic synchronization when creating new store integrations:

### How Auto-Sync Works

1. When creating a new store integration, users can check "Run initial sync immediately"
2. If enabled, a background sync job is dispatched immediately after integration creation
3. The sync happens asynchronously using Laravel's `dispatch()->afterResponse()` mechanism
4. Users receive feedback that the sync has been initiated

### Implementation Details

- The auto-sync option is controlled via the `auto_sync` parameter in the integration creation form
- The sync job is dispatched in `StoreIntegrationController@store`
- The sync is only performed if the integration is also marked as active

## Manual Sync

Users can trigger manual synchronization through the UI:

1. Navigate to Store Integrations
2. Select a specific integration
3. Click the "Sync Products" button

This process invokes the `StoreIntegrationController@sync` method, which:
- Verifies user permissions
- Checks that the integration is active
- Calls the `InventorySyncService@syncAllProducts` method
- Displays success/error messages with sync statistics

## Configuring the Scheduler

For the scheduled jobs to run properly, the Laravel scheduler must be configured:

### Production Environment

Add the following entry to your server's crontab:

```
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

This will run the scheduler every minute, which will then execute any due jobs according to their configured schedules.

### Development Environment

For local development, you can use:

```bash
php artisan schedule:work
```

This command simulates the scheduler and will run in the foreground, executing due tasks as they come up.

### Customizing the Schedule

To modify the frequency of sync jobs:

1. Open `app/Console/Kernel.php`
2. Locate the `schedule()` method
3. Adjust the schedule timing using Laravel's fluent scheduler API:

```php
// Example: Change to run every 2 hours instead of 4
$schedule->command('inventory:sync-all-stores')->everyTwoHours();

// Example: Change to run every 30 minutes instead of hourly
$schedule->command('inventory:check-alerts')->everyThirtyMinutes();
```

## Sync Logs

The system maintains logs of all synchronization activities:

### Viewing Sync Logs

1. Sync logs are recorded in the `sync_logs` table
2. Each store integration's details page displays its recent sync history
3. Logs include start time, completion time, and summary of changes

### Log Structure

Each sync log entry contains:
- Store integration ID
- Start and end timestamps
- Success/failure status
- Counts of created, updated, and skipped products
- Error messages (if applicable)

## Troubleshooting

### Common Sync Issues

1. **Sync not running on schedule**
   - Verify cron is set up correctly
   - Check server logs for cron execution
   - Ensure the scheduler command is running with correct permissions

2. **Failed synchronization**
   - Check store integration credentials
   - Verify API access is still valid
   - Look for rate limiting issues from the platform

3. **Incomplete data sync**
   - Check for platform-specific filtering that may exclude products
   - Verify API permissions include all necessary scopes
   - Check for large product catalogs that may require pagination

### Debugging Sync Issues

For more detailed debugging:

1. Run a manual sync with the `--verbose` flag:
   ```bash
   php artisan inventory:sync-all-stores --verbose
   ```

2. Check Laravel logs in `storage/logs/laravel.log`

3. Enable debug mode in `.env`:
   ```
   APP_DEBUG=true
   LOG_LEVEL=debug
   ```

---

For additional help with sync configuration, consult the Laravel documentation on [Task Scheduling](https://laravel.com/docs/10.x/scheduling).
