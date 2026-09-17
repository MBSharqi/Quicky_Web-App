<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('pickup_lat', 10, 7)->nullable()->after('pickup_city');
            $table->decimal('pickup_lng', 10, 7)->nullable()->after('pickup_lat');
            $table->decimal('dropoff_lat', 10, 7)->nullable()->after('dropoff_city');
            $table->decimal('dropoff_lng', 10, 7)->nullable()->after('dropoff_lat');
            $table->decimal('rider_lat', 10, 7)->nullable()->after('delivery_fee');
            $table->decimal('rider_lng', 10, 7)->nullable()->after('rider_lat');
            $table->timestamp('rider_location_updated_at')->nullable()->after('rider_lng');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'pickup_lat',
                'pickup_lng',
                'dropoff_lat',
                'dropoff_lng',
                'rider_lat',
                'rider_lng',
                'rider_location_updated_at',
            ]);
        });
    }
};
