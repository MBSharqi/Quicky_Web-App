<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'role' => $user->role->value,
            'stats' => match ($user->role) {
                Role::Admin => $this->adminStats(),
                Role::Customer => $this->customerStats($user),
                Role::Rider => $this->riderStats($user),
                Role::Shop => $this->shopStats($user),
            },
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function adminStats(): array
    {
        $statusCounts = Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'orders_total' => Order::query()->count(),
            'orders_pending' => (int) ($statusCounts[OrderStatus::Pending->value] ?? 0),
            'orders_accepted' => (int) ($statusCounts[OrderStatus::Accepted->value] ?? 0),
            'orders_ready' => (int) ($statusCounts[OrderStatus::ReadyForPickup->value] ?? 0),
            'orders_assigned' => (int) ($statusCounts[OrderStatus::Assigned->value] ?? 0),
            'orders_picked_up' => (int) ($statusCounts[OrderStatus::PickedUp->value] ?? 0),
            'orders_delivered' => (int) ($statusCounts[OrderStatus::Delivered->value] ?? 0),
            'orders_cancelled' => (int) ($statusCounts[OrderStatus::Cancelled->value] ?? 0),
            'cod_unpaid_total' => (float) Order::query()
                ->where('payment_status', PaymentStatus::Unpaid)
                ->where('status', '!=', OrderStatus::Cancelled)
                ->sum('total'),
            'cod_paid_total' => (float) Order::query()
                ->where('payment_status', PaymentStatus::Paid)
                ->sum('total'),
            'riders_total' => User::query()->where('role', Role::Rider)->count(),
            'customers_total' => User::query()->where('role', Role::Customer)->count(),
            'shops_total' => Shop::query()->count(),
            'shops_open' => Shop::query()->where('is_open', true)->count(),
            'recent_orders' => Order::query()
                ->with(['customer:id,name', 'rider:id,name', 'shop:id,name'])
                ->latest()
                ->limit(5)
                ->get(['id', 'customer_id', 'rider_id', 'shop_id', 'status', 'payment_status', 'delivery_fee', 'subtotal', 'total', 'pickup_city', 'dropoff_city', 'created_at']),
            'recent_shops' => Shop::query()
                ->with(['owner:id,name,email'])
                ->latest()
                ->limit(5)
                ->get(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function customerStats(User $user): array
    {
        $query = Order::query()->where('customer_id', $user->id);

        return [
            'orders_total' => (clone $query)->count(),
            'orders_pending' => (clone $query)->where('status', OrderStatus::Pending)->count(),
            'orders_active' => (clone $query)->whereIn('status', [
                OrderStatus::Accepted,
                OrderStatus::ReadyForPickup,
                OrderStatus::Assigned,
                OrderStatus::PickedUp,
            ])->count(),
            'orders_delivered' => (clone $query)->where('status', OrderStatus::Delivered)->count(),
            'cod_unpaid_total' => (float) (clone $query)
                ->where('payment_status', PaymentStatus::Unpaid)
                ->where('status', '!=', OrderStatus::Cancelled)
                ->sum('total'),
            'recent_orders' => Order::query()
                ->where('customer_id', $user->id)
                ->with(['shop:id,name'])
                ->latest()
                ->limit(5)
                ->get(['id', 'shop_id', 'status', 'payment_status', 'delivery_fee', 'subtotal', 'total', 'pickup_city', 'dropoff_city', 'created_at']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function riderStats(User $user): array
    {
        $query = Order::query()->where('rider_id', $user->id);

        return [
            'orders_total' => (clone $query)->count(),
            'orders_available' => Order::query()->where('status', OrderStatus::ReadyForPickup)->count(),
            'orders_assigned' => (clone $query)->where('status', OrderStatus::Assigned)->count(),
            'orders_picked_up' => (clone $query)->where('status', OrderStatus::PickedUp)->count(),
            'orders_delivered' => (clone $query)->where('status', OrderStatus::Delivered)->count(),
            'cod_to_collect' => (float) (clone $query)
                ->where('payment_status', PaymentStatus::Unpaid)
                ->whereIn('status', [OrderStatus::Assigned, OrderStatus::PickedUp, OrderStatus::Delivered])
                ->sum('total'),
            'recent_orders' => Order::query()
                ->where(function ($inner) use ($user) {
                    $inner->where('rider_id', $user->id)
                        ->orWhere('status', OrderStatus::ReadyForPickup);
                })
                ->with(['shop:id,name'])
                ->latest()
                ->limit(5)
                ->get(['id', 'shop_id', 'status', 'payment_status', 'delivery_fee', 'subtotal', 'total', 'pickup_city', 'dropoff_city', 'created_at']),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function shopStats(User $user): array
    {
        $shop = $user->shop;
        $orders = $shop
            ? Order::query()->where('shop_id', $shop->id)
            : Order::query()->whereRaw('0 = 1');

        return [
            'shop_name' => $shop?->name,
            'shop_type' => $shop?->type?->value,
            'is_open' => (bool) $shop?->is_open,
            'menu_items_total' => $shop ? $shop->menuItems()->count() : 0,
            'menu_items_available' => $shop ? $shop->menuItems()->where('is_available', true)->count() : 0,
            'orders_total' => (clone $orders)->count(),
            'orders_pending' => (clone $orders)->where('status', OrderStatus::Pending)->count(),
            'orders_accepted' => (clone $orders)->where('status', OrderStatus::Accepted)->count(),
            'orders_ready' => (clone $orders)->where('status', OrderStatus::ReadyForPickup)->count(),
        ];
    }
}
