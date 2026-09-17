<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreShopRequest;
use App\Http\Requests\Admin\UpdateShopRequest;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ShopController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Shop::class);

        $shops = Shop::query()
            ->with(['owner:id,name,email'])
            ->latest()
            ->paginate(15);

        return response()->json($shops);
    }

    public function store(StoreShopRequest $request): JsonResponse
    {
        $shop = DB::transaction(function () use ($request) {
            $owner = User::create([
                'name' => $request->validated('owner_name'),
                'email' => $request->validated('owner_email'),
                'password' => $request->validated('owner_password'),
                'role' => Role::Shop,
            ]);

            return Shop::create([
                'user_id' => $owner->id,
                'name' => $request->validated('name'),
                'type' => $request->validated('type'),
                'description' => $request->validated('description'),
                'address' => $request->validated('address'),
                'city' => $request->validated('city'),
                'lat' => $request->validated('lat'),
                'lng' => $request->validated('lng'),
                'phone' => $request->validated('phone'),
                'logo_url' => $request->validated('logo_url'),
                'is_open' => $request->boolean('is_open', false),
            ]);
        });

        $shop->load(['owner:id,name,email']);

        return response()->json([
            'shop' => $shop,
        ], 201);
    }

    public function show(Shop $shop): JsonResponse
    {
        $this->authorize('view', $shop);

        $shop->load(['owner:id,name,email']);

        return response()->json([
            'shop' => $shop,
        ]);
    }

    public function update(UpdateShopRequest $request, Shop $shop): JsonResponse
    {
        $shop->update($request->validated());
        $shop->load(['owner:id,name,email']);

        return response()->json([
            'shop' => $shop,
        ]);
    }
}
