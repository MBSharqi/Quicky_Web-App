<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'customer_id',
        'rider_id',
        'shop_id',
        'pickup_address',
        'pickup_city',
        'pickup_lat',
        'pickup_lng',
        'pickup_contact_name',
        'pickup_contact_phone',
        'dropoff_address',
        'dropoff_city',
        'dropoff_lat',
        'dropoff_lng',
        'dropoff_contact_name',
        'dropoff_contact_phone',
        'package_description',
        'notes',
        'status',
        'payment_method',
        'payment_status',
        'delivery_fee',
        'subtotal',
        'total',
        'rider_lat',
        'rider_lng',
        'rider_location_updated_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_method' => PaymentMethod::class,
            'payment_status' => PaymentStatus::class,
            'delivery_fee' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'total' => 'decimal:2',
            'pickup_lat' => 'float',
            'pickup_lng' => 'float',
            'dropoff_lat' => 'float',
            'dropoff_lng' => 'float',
            'rider_lat' => 'float',
            'rider_lng' => 'float',
            'rider_location_updated_at' => 'datetime',
        ];
    }

    public function isShopOrder(): bool
    {
        return $this->shop_id !== null;
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function rider(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rider_id');
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
