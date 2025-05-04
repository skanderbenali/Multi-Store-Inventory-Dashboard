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
        Schema::create('store_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Store name
            $table->enum('platform', ['shopify', 'etsy', 'amazon']); // Store platform
            $table->string('shop_url')->nullable(); // Store URL (e.g., myshop.myshopify.com)
            $table->string('api_key')->nullable(); // API key if applicable
            $table->text('api_secret')->nullable(); // API secret if applicable
            $table->text('access_token')->nullable(); // OAuth access token
            $table->text('refresh_token')->nullable(); // OAuth refresh token
            $table->timestamp('token_expires_at')->nullable(); // Token expiry date
            $table->json('additional_data')->nullable(); // Additional platform-specific data
            $table->boolean('is_active')->default(true); // Whether integration is active
            $table->timestamp('last_sync_at')->nullable(); // Last successful sync time
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
        Schema::dropIfExists('store_integrations');
    }
};
