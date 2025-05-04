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
        Schema::create('stock_alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // User to notify
            $table->integer('threshold')->default(5); // Stock threshold to trigger alert
            $table->enum('status', ['pending', 'triggered', 'resolved'])->default('pending');
            $table->enum('notification_method', ['email', 'in_app', 'slack', 'discord'])->default('email');
            $table->boolean('is_active')->default(true);
            $table->timestamp('triggered_at')->nullable(); // When the alert was triggered
            $table->timestamp('resolved_at')->nullable(); // When the stock level returned above threshold
            $table->timestamp('notified_at')->nullable(); // When the user was last notified
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
        Schema::dropIfExists('stock_alerts');
    }
};
