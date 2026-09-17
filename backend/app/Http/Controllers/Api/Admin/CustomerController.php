<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'q' => ['sometimes', 'nullable', 'string', 'max:100'],
        ]);

        $customers = User::query()
            ->where('role', Role::Customer)
            ->when(
                ! empty($validated['q']),
                function ($query) use ($validated) {
                    $term = '%'.$validated['q'].'%';
                    $query->where(function ($inner) use ($term) {
                        $inner->where('name', 'like', $term)
                            ->orWhere('email', 'like', $term);
                    });
                }
            )
            ->withCount([
                'customerOrders as orders_total',
                'customerOrders as orders_delivered' => fn ($query) => $query->where('status', OrderStatus::Delivered),
            ])
            ->withSum('customerOrders as spend_total', 'total')
            ->latest()
            ->paginate(15);

        return response()->json($customers);
    }

    public function show(User $customer): JsonResponse
    {
        abort_unless($customer->role === Role::Customer, 404);

        $customer->loadCount([
            'customerOrders as orders_total',
            'customerOrders as orders_delivered' => fn ($query) => $query->where('status', OrderStatus::Delivered),
        ]);
        $customer->loadSum('customerOrders as spend_total', 'total');

        $recentOrders = $customer->customerOrders()
            ->with(['shop:id,name', 'rider:id,name'])
            ->latest()
            ->limit(10)
            ->get([
                'id',
                'shop_id',
                'rider_id',
                'status',
                'payment_status',
                'total',
                'created_at',
            ]);

        return response()->json([
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'created_at' => $customer->created_at,
                'orders_total' => (int) $customer->orders_total,
                'orders_delivered' => (int) $customer->orders_delivered,
                'spend_total' => (float) ($customer->spend_total ?? 0),
            ],
            'recent_orders' => $recentOrders,
        ]);
    }
}
