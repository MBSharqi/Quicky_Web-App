<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\AssignOrderRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\StoreShopOrderRequest;
use App\Http\Requests\UpdateOrderLocationRequest;
use App\Http\Requests\UpdateOrderPaymentRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Shop;
use App\Models\User;
use App\Notifications\OrderAssigned;
use App\Notifications\OrderCreated;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $validated = $request->validate([
            'status' => ['sometimes', 'nullable', Rule::enum(OrderStatus::class)],
            'payment_status' => ['sometimes', 'nullable', Rule::enum(PaymentStatus::class)],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $user = $request->user();

        $orders = Order::query()
            ->with(['customer:id,name,email', 'rider:id,name,email', 'shop:id,name,slug', 'items'])
            ->when($user->role === Role::Customer, fn ($query) => $query->where('customer_id', $user->id))
            ->when($user->role === Role::Rider, function ($query) use ($user) {
                $query->where(function ($inner) use ($user) {
                    $inner->where('rider_id', $user->id)
                        ->orWhere('status', OrderStatus::ReadyForPickup);
                });
            })
            ->when($user->role === Role::Shop, function ($query) use ($user) {
                $shopId = $user->shop?->id;
                $query->where('shop_id', $shopId ?? 0);
            })
            ->when(
                ! empty($validated['status']),
                fn ($query) => $query->where('status', $validated['status'])
            )
            ->when(
                ! empty($validated['payment_status']),
                fn ($query) => $query->where('payment_status', $validated['payment_status'])
            )
            ->latest()
            ->paginate(15);

        return response()->json($orders);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $order = Order::create([
            ...$validated,
            'customer_id' => $request->user()->id,
            'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Unpaid,
            'subtotal' => 0,
            'total' => $validated['delivery_fee'],
        ]);

        $order->load(['customer:id,name,email', 'rider:id,name,email', 'shop:id,name,slug', 'items']);

        $admins = User::query()->where('role', Role::Admin)->get();
        Notification::send($admins, new OrderCreated($order));

        return response()->json([
            'order' => $order,
        ], 201);
    }

    public function storeShopOrder(StoreShopOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();

        /** @var Shop $shop */
        $shop = Shop::query()->findOrFail($validated['shop_id']);

        if (! $shop->is_open) {
            throw ValidationException::withMessages([
                'shop_id' => ['This shop is currently closed.'],
            ]);
        }

        $menuItemIds = collect($validated['items'])->pluck('menu_item_id')->all();
        $menuItems = MenuItem::query()
            ->where('shop_id', $shop->id)
            ->whereIn('id', $menuItemIds)
            ->get()
            ->keyBy('id');

        if ($menuItems->count() !== count($menuItemIds)) {
            throw ValidationException::withMessages([
                'items' => ['One or more menu items are invalid for this shop.'],
            ]);
        }

        $unavailable = $menuItems->first(fn (MenuItem $item) => ! $item->is_available);
        if ($unavailable) {
            throw ValidationException::withMessages([
                'items' => ["{$unavailable->name} is currently unavailable."],
            ]);
        }

        $lineRows = [];
        $subtotal = 0.0;

        foreach ($validated['items'] as $line) {
            /** @var MenuItem $menuItem */
            $menuItem = $menuItems->get($line['menu_item_id']);
            $quantity = (int) $line['quantity'];
            $unitPrice = (float) $menuItem->price;
            $lineTotal = round($unitPrice * $quantity, 2);
            $subtotal += $lineTotal;

            $lineRows[] = [
                'menu_item_id' => $menuItem->id,
                'name' => $menuItem->name,
                'unit_price' => $unitPrice,
                'quantity' => $quantity,
                'line_total' => $lineTotal,
            ];
        }

        $deliveryFee = (float) ($validated['delivery_fee'] ?? 0);
        $total = round($subtotal + $deliveryFee, 2);

        $order = DB::transaction(function () use ($request, $validated, $shop, $lineRows, $subtotal, $deliveryFee, $total) {
            $order = Order::create([
                'customer_id' => $request->user()->id,
                'shop_id' => $shop->id,
                'pickup_address' => $shop->address,
                'pickup_city' => $shop->city,
                'pickup_lat' => $shop->lat,
                'pickup_lng' => $shop->lng,
                'pickup_contact_name' => $shop->name,
                'pickup_contact_phone' => $shop->phone ?: 'N/A',
                'dropoff_address' => $validated['dropoff_address'],
                'dropoff_city' => $validated['dropoff_city'],
                'dropoff_lat' => $validated['dropoff_lat'] ?? null,
                'dropoff_lng' => $validated['dropoff_lng'] ?? null,
                'dropoff_contact_name' => $validated['dropoff_contact_name'],
                'dropoff_contact_phone' => $validated['dropoff_contact_phone'],
                'notes' => $validated['notes'] ?? null,
                'package_description' => 'Shop order',
                'status' => OrderStatus::Pending,
                'payment_method' => $validated['payment_method'] ?? PaymentMethod::Cod,
                'payment_status' => PaymentStatus::Unpaid,
                'delivery_fee' => $deliveryFee,
                'subtotal' => $subtotal,
                'total' => $total,
            ]);

            $order->items()->createMany($lineRows);

            return $order;
        });

        $order->load(['customer:id,name,email', 'rider:id,name,email', 'shop:id,name,slug', 'items']);

        if ($shop->owner) {
            $shop->owner->notify(new OrderCreated($order));
        }

        $admins = User::query()->where('role', Role::Admin)->get();
        Notification::send($admins, new OrderCreated($order));

        return response()->json([
            'order' => $order,
        ], 201);
    }

    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $order->load(['customer:id,name,email', 'rider:id,name,email', 'shop:id,name,slug,address,city,phone', 'items']);

        return response()->json([
            'order' => $order,
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $order->update([
            'status' => $request->validated('status'),
        ]);

        $order->load(['customer:id,name,email', 'rider:id,name,email', 'shop:id,name,slug', 'items']);

        $recipients = collect([$order->customer])
            ->when($order->rider, fn ($collection) => $collection->push($order->rider))
            ->when($order->shop?->owner, fn ($collection) => $collection->push($order->shop->owner))
            ->filter(fn (User $user) => $user->id !== $request->user()->id)
            ->unique('id');

        Notification::send($recipients, new OrderStatusUpdated($order));

        return response()->json([
            'order' => $order,
        ]);
    }

    public function updatePayment(UpdateOrderPaymentRequest $request, Order $order): JsonResponse
    {
        $order->update([
            'payment_status' => $request->validated('payment_status'),
        ]);

        $order->load(['customer:id,name,email', 'rider:id,name,email', 'shop:id,name,slug', 'items']);

        return response()->json([
            'order' => $order,
        ]);
    }

    public function updateLocation(UpdateOrderLocationRequest $request, Order $order): JsonResponse
    {
        $order->update([
            'rider_lat' => $request->validated('lat'),
            'rider_lng' => $request->validated('lng'),
            'rider_location_updated_at' => now(),
        ]);

        $order->load(['customer:id,name,email', 'rider:id,name,email', 'shop:id,name,slug', 'items']);

        return response()->json([
            'order' => $order,
        ]);
    }

    public function assign(AssignOrderRequest $request, Order $order): JsonResponse
    {
        $order->update([
            'rider_id' => $request->validated('rider_id'),
            'status' => OrderStatus::Assigned,
        ]);

        $order->load(['customer:id,name,email', 'rider:id,name,email', 'shop:id,name,slug', 'items']);

        $order->rider->notify(new OrderAssigned($order));
        $order->customer->notify(new OrderAssigned($order));

        if ($order->shop?->owner) {
            $order->shop->owner->notify(new OrderAssigned($order));
        }

        return response()->json([
            'order' => $order,
        ]);
    }

    public function claim(Request $request, Order $order): JsonResponse
    {
        $this->authorize('claim', $order);

        $claimed = DB::transaction(function () use ($request, $order) {
            /** @var Order|null $locked */
            $locked = Order::query()->whereKey($order->id)->lockForUpdate()->first();

            if (! $locked || $locked->status !== OrderStatus::ReadyForPickup || $locked->rider_id !== null) {
                return null;
            }

            $locked->update([
                'rider_id' => $request->user()->id,
                'status' => OrderStatus::Assigned,
            ]);

            return $locked;
        });

        if (! $claimed) {
            throw ValidationException::withMessages([
                'order' => ['This order was already claimed by another rider.'],
            ]);
        }

        $claimed->load(['customer:id,name,email', 'rider:id,name,email', 'shop:id,name,slug', 'items']);

        $claimed->customer->notify(new OrderAssigned($claimed));
        if ($claimed->shop?->owner) {
            $claimed->shop->owner->notify(new OrderAssigned($claimed));
        }

        return response()->json([
            'order' => $claimed,
        ]);
    }
}
