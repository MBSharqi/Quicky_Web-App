<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRiderRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RiderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => ['sometimes', 'integer', 'min:1'],
            'q' => ['sometimes', 'nullable', 'string', 'max:100'],
        ]);

        $riders = User::query()
            ->where('role', Role::Rider)
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
                'riderOrders as active_orders_count' => fn ($query) => $query->whereIn('status', [
                    OrderStatus::Assigned,
                    OrderStatus::PickedUp,
                ]),
                'riderOrders as delivered_orders_count' => fn ($query) => $query->where('status', OrderStatus::Delivered),
            ])
            ->orderBy('name')
            ->paginate(15);

        return response()->json($riders);
    }

    public function store(StoreRiderRequest $request): JsonResponse
    {
        $rider = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => $request->validated('password'),
            'role' => Role::Rider,
        ]);

        return response()->json([
            'rider' => $rider->only(['id', 'name', 'email', 'role', 'created_at']),
        ], 201);
    }

    public function show(User $rider): JsonResponse
    {
        abort_unless($rider->role === Role::Rider, 404);

        $rider->loadCount([
            'riderOrders as active_orders_count' => fn ($query) => $query->whereIn('status', [
                OrderStatus::Assigned,
                OrderStatus::PickedUp,
            ]),
            'riderOrders as delivered_orders_count' => fn ($query) => $query->where('status', OrderStatus::Delivered),
        ]);

        return response()->json([
            'rider' => [
                'id' => $rider->id,
                'name' => $rider->name,
                'email' => $rider->email,
                'role' => $rider->role->value,
                'created_at' => $rider->created_at,
                'active_orders_count' => $rider->active_orders_count,
                'delivered_orders_count' => $rider->delivered_orders_count,
            ],
        ]);
    }

    public function update(Request $request, User $rider): JsonResponse
    {
        abort_unless($rider->role === Role::Rider, 404);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($rider->id),
            ],
            'password' => ['sometimes', 'nullable', 'confirmed', Password::defaults()],
        ]);

        $payload = collect($validated)->except('password')->all();

        if (! empty($validated['password'])) {
            $payload['password'] = $validated['password'];
        }

        $rider->update($payload);

        return response()->json([
            'rider' => $rider->only(['id', 'name', 'email', 'role', 'created_at']),
        ]);
    }
}
