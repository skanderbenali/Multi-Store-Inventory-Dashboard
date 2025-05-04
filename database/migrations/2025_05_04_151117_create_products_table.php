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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_integration_id')->constrained()->onDelete('cascade');
            $table->string('title'); // Product title
            $table->string('sku')->index(); // Stock keeping unit
            $table->string('platform_product_id')->nullable()->index(); // ID on the original platform
            $table->integer('quantity')->default(0); // Current stock quantity
            $table->integer('low_stock_threshold')->default(5); // Threshold for low stock alerts
            $table->decimal('price', 10, 2)->nullable(); // Product price
            $table->text('description')->nullable(); // Product description
            $table->json('images')->nullable(); // Product images URLs
            $table->json('variants')->nullable(); // Product variants if applicable
            $table->json('additional_data')->nullable(); // Additional platform-specific data
            $table->timestamp('last_sync_at')->nullable(); // Last time product was synced
            $table->timestamps();
            
            // Create a composite index for SKU and integration for faster lookups
            $table->unique(['sku', 'store_integration_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('products');
    }
};
