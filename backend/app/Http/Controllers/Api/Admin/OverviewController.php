<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Shop;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OverviewController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $days = (int) $request->integer('days', 7);
        $days = max(1, min($days, 30));

        return response()->json([
            'summary' => $this->summary(),
            'live_orders' => $this->fetchLiveOrders(),
            'revenue_by_day' => $this->revenueByDay($days),
            'shop_performance' => $this->shopPerformance(),
            'top_riders' => $this->topRiders(),
        ]);
    }

    public function live(Request $request): JsonResponse
    {
        $summary = $this->summary();

        return response()->json([
            'orders' => $this->fetchLiveOrders(),
            'summary' => [
                'orders_live' => $summary['orders_live'],
                'orders_pending' => $summary['orders_pending'],
                'orders_ready' => $summary['orders_ready'],
                'orders_in_delivery' => $summary['orders_in_delivery'],
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function summary(): array
    {
        $statusCounts = Order::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $activeStatuses = [
            OrderStatus::Pending->value,
            OrderStatus::Accepted->value,
            OrderStatus::ReadyForPickup->value,
            OrderStatus::Assigned->value,
            OrderStatus::PickedUp->value,
        ];

        $ordersLive = collect($activeStatuses)->sum(
            fn (string $status) => (int) ($statusCounts[$status] ?? 0)
        );

        $todayPaid = (float) Order::query()
            ->where('payment_status', PaymentStatus::Paid)
            ->whereDate('updated_at', Carbon::today())
            ->sum('total');

        $todayOrders = Order::query()->whereDate('created_at', Carbon::today())->count();

        return [
            'shops_total' => Shop::query()->count(),
            'shops_open' => Shop::query()->where('is_open', true)->count(),
            'riders_total' => User::query()->where('role', Role::Rider)->count(),
            'customers_total' => User::query()->where('role', Role::Customer)->count(),
            'orders_total' => Order::query()->count(),
            'orders_live' => $ordersLive,
            'orders_pending' => (int) ($statusCounts[OrderStatus::Pending->value] ?? 0),
            'orders_ready' => (int) ($statusCounts[OrderStatus::ReadyForPickup->value] ?? 0),
            'orders_in_delivery' => (int) ($statusCounts[OrderStatus::Assigned->value] ?? 0)
                + (int) ($statusCounts[OrderStatus::PickedUp->value] ?? 0),
            'orders_delivered' => (int) ($statusCounts[OrderStatus::Delivered->value] ?? 0),
            'orders_cancelled' => (int) ($statusCounts[OrderStatus::Cancelled->value] ?? 0),
            'cod_paid_total' => (float) Order::query()
                ->where('payment_status', PaymentStatus::Paid)
                ->sum('total'),
            'cod_unpaid_total' => (float) Order::query()
                ->where('payment_status', PaymentStatus::Unpaid)
                ->where('status', '!=', OrderStatus::Cancelled)
                ->sum('total'),
            'cod_paid_today' => $todayPaid,
            'orders_today' => $todayOrders,
        ];
    }

    /**
     * @return \Illuminate\Support\Collection<int, Order>
     */
    private function fetchLiveOrders()
    {
        return Order::query()
            ->with([
                'customer:id,name,email',
                'rider:id,name,email',
                'shop:id,name,slug',
            ])
            ->whereIn('status', [
                OrderStatus::Pending,
                OrderStatus::Accepted,
                OrderStatus::ReadyForPickup,
                OrderStatus::Assigned,
                OrderStatus::PickedUp,
            ])
            ->latest()
            ->limit(40)
            ->get([
                'id',
                'customer_id',
                'rider_id',
                'shop_id',
                'status',
                'payment_status',
                'subtotal',
                'delivery_fee',
                'total',
                'pickup_city',
                'dropoff_city',
                'created_at',
                'updated_at',
            ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function revenueByDay(int $days): array
    {
        $start = Carbon::today()->subDays($days - 1);

        $rows = Order::query()
            ->selectRaw('DATE(created_at) as day')
            ->selectRaw('SUM(CASE WHEN payment_status = ? THEN total ELSE 0 END) as paid_total', [PaymentStatus::Paid->value])
            ->selectRaw('COUNT(*) as orders_count')
            ->selectRaw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as delivered_count', [OrderStatus::Delivered->value])
            ->where('created_at', '>=', $start->copy()->startOfDay())
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('day')
            ->get()
            ->keyBy(fn ($row) => (string) $row->day);

        $series = [];
        for ($i = 0; $i < $days; $i++) {
            $day = $start->copy()->addDays($i)->toDateString();
            $row = $rows->get($day);
            $series[] = [
                'day' => $day,
                'paid_total' => (float) ($row->paid_total ?? 0),
                'orders_count' => (int) ($row->orders_count ?? 0),
                'delivered_count' => (int) ($row->delivered_count ?? 0),
            ];
        }

        return $series;
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function shopPerformance(): array
    {
        $shops = Shop::query()
            ->with(['owner:id,name,email'])
            ->withCount([
                'orders as orders_total',
                'orders as orders_pending' => fn ($query) => $query->where('status', OrderStatus::Pending),
                'orders as orders_cancelled' => fn ($query) => $query->where('status', OrderStatus::Cancelled),
                'orders as orders_delivered' => fn ($query) => $query->where('status', OrderStatus::Delivered),
                'orders as orders_accepted_plus' => fn ($query) => $query->whereIn('status', [
                    OrderStatus::Accepted,
                    OrderStatus::ReadyForPickup,
                    OrderStatus::Assigned,
                    OrderStatus::PickedUp,
                    OrderStatus::Delivered,
                ]),
            ])
            ->withSum([
                'orders as revenue_paid' => fn ($query) => $query->where('payment_status', PaymentStatus::Paid),
            ], 'total')
            ->orderByDesc('orders_total')
            ->limit(20)
            ->get();

        return $shops->map(function (Shop $shop) {
            $actioned = (int) $shop->orders_accepted_plus + (int) $shop->orders_cancelled;
            $acceptanceRate = $actioned > 0
                ? round(((int) $shop->orders_accepted_plus / $actioned) * 100, 1)
                : null;

            return [
                'id' => $shop->id,
                'name' => $shop->name,
                'slug' => $shop->slug,
                'type' => $shop->type?->value,
                'is_open' => $shop->is_open,
                'owner' => $shop->owner,
                'orders_total' => (int) $shop->orders_total,
                'orders_pending' => (int) $shop->orders_pending,
                'orders_cancelled' => (int) $shop->orders_cancelled,
                'orders_delivered' => (int) $shop->orders_delivered,
                'revenue_paid' => (float) ($shop->revenue_paid ?? 0),
                'acceptance_rate' => $acceptanceRate,
            ];
        })->values()->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function topRiders(): array
    {
        return User::query()
            ->where('role', Role::Rider)
            ->withCount([
                'riderOrders as delivered_orders_count' => fn ($query) => $query->where('status', OrderStatus::Delivered),
                'riderOrders as active_orders_count' => fn ($query) => $query->whereIn('status', [
                    OrderStatus::Assigned,
                    OrderStatus::PickedUp,
                ]),
            ])
            ->withSum([
                'riderOrders as cod_collected' => fn ($query) => $query
                    ->where('payment_status', PaymentStatus::Paid)
                    ->where('status', OrderStatus::Delivered),
            ], 'total')
            ->orderByDesc('delivered_orders_count')
            ->limit(8)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $rider) => [
                'id' => $rider->id,
                'name' => $rider->name,
                'email' => $rider->email,
                'delivered_orders_count' => (int) $rider->delivered_orders_count,
                'active_orders_count' => (int) $rider->active_orders_count,
                'cod_collected' => (float) ($rider->cod_collected ?? 0),
            ])
            ->all();
    }
}
