<?php

namespace App\Http\Controllers\Api\Shop;

use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use App\Notifications\OrderReadyForPickup;
use App\Notifications\OrderStatusUpdated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Order::class);

        $shop = $request->user()->shop;
        abort_unless($shop, 404);

        $validated = $request->validate([
            'status' => ['sometimes', 'nullable', Rule::enum(OrderStatus::class)],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $orders = Order::query()
            ->with(['customer:id,name,email', 'rider:id,name,email', 'items', 'shop:id,name,slug'])
            ->where('shop_id', $shop->id)
            ->when(
                ! empty($validated['status']),
                fn ($query) => $query->where('status', $validated['status'])
            )
            ->latest()
            ->paginate(15);

        return response()->json($orders);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        $order->load(['customer:id,name,email', 'rider:id,name,email', 'items', 'shop:id,name,slug,address,city,phone']);

        return response()->json([
            'order' => $order,
        ]);
    }

    public function accept(Request $request, Order $order): JsonResponse
    {
        $this->authorize('accept', $order);

        $order->update([
            'status' => OrderStatus::Accepted,
        ]);

        return $this->respondWithStatusNotification($request, $order);
    }

    public function reject(Request $request, Order $order): JsonResponse
    {
        $this->authorize('reject', $order);

        $order->update([
            'status' => OrderStatus::Cancelled,
        ]);

        return $this->respondWithStatusNotification($request, $order);
    }

    public function release(Request $request, Order $order): JsonResponse
    {
        $this->authorize('release', $order);

        $order->update([
            'status' => OrderStatus::ReadyForPickup,
        ]);

        $order->load(['customer:id,name,email', 'rider:id,name,email', 'items', 'shop:id,name,slug']);

        $order->customer->notify(new OrderStatusUpdated($order));

        $riders = User::query()->where('role', Role::Rider)->get();
        Notification::send($riders, new OrderReadyForPickup($order));

        return response()->json([
            'order' => $order,
        ]);
    }

    private function respondWithStatusNotification(Request $request, Order $order): JsonResponse
    {
        $order->load(['customer:id,name,email', 'rider:id,name,email', 'items', 'shop:id,name,slug']);

        $recipients = collect([$order->customer])
            ->when($order->rider, fn ($collection) => $collection->push($order->rider))
            ->filter(fn (User $user) => $user->id !== $request->user()->id)
            ->unique('id');

        Notification::send($recipients, new OrderStatusUpdated($order));

        return response()->json([
            'order' => $order,
        ]);
    }
}
