<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Sync inventory from all active stores every 4 hours
        $schedule->command('inventory:sync-all-stores')
            ->everyFourHours()
            ->withoutOverlapping()
            ->runInBackground()
            ->appendOutputTo(storage_path('logs/inventory-sync.log'));
        
        // Check stock alerts hourly
        $schedule->command('inventory:check-alerts')
            ->hourly()
            ->withoutOverlapping()
            ->runInBackground()
            ->appendOutputTo(storage_path('logs/stock-alerts.log'));
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
