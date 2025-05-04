<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('inventory_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_integration_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete(); // Can be null if syncing all products
            $table->enum('sync_type', ['manual', 'scheduled', 'webhook']); // Type of sync operation
            $table->enum('status', ['pending', 'in_progress', 'completed', 'failed'])->default('pending');
            $table->text('message')->nullable(); // Status message or error details
            $table->integer('products_synced')->default(0); // Number of products synced
            $table->integer('products_failed')->default(0); // Number of products that failed to sync
            $table->json('details')->nullable(); // Additional details about the sync process
            $table->timestamp('started_at')->nullable(); // When the sync process started
            $table->timestamp('completed_at')->nullable(); // When the sync process completed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('inventory_sync_logs');
    }
};
