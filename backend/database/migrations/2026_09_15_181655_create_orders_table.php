<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('rider_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('pickup_address');
            $table->string('pickup_city');
            $table->string('pickup_contact_name');
            $table->string('pickup_contact_phone');
            $table->string('dropoff_address');
            $table->string('dropoff_city');
            $table->string('dropoff_contact_name');
            $table->string('dropoff_contact_phone');
            $table->string('package_description')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
