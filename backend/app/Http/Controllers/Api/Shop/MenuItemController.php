<?php

namespace App\Http\Controllers\Api\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\Shop\StoreMenuItemRequest;
use App\Http\Requests\Shop\UpdateMenuItemAvailabilityRequest;
use App\Http\Requests\Shop\UpdateMenuItemRequest;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MenuItemController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', MenuItem::class);

        $items = $request->user()->shop
            ->menuItems()
            ->latest()
            ->paginate(20);

        return response()->json($items);
    }

    public function store(StoreMenuItemRequest $request): JsonResponse
    {
        $item = $request->user()->shop->menuItems()->create([
            ...$request->validated(),
            'is_available' => $request->boolean('is_available', true),
            'sort_order' => $request->integer('sort_order', 0),
        ]);

        return response()->json([
            'menu_item' => $item,
        ], 201);
    }

    public function show(MenuItem $menuItem): JsonResponse
    {
        $this->authorize('view', $menuItem);

        return response()->json([
            'menu_item' => $menuItem,
        ]);
    }

    public function update(UpdateMenuItemRequest $request, MenuItem $menuItem): JsonResponse
    {
        $menuItem->update($request->validated());

        return response()->json([
            'menu_item' => $menuItem->fresh(),
        ]);
    }

    public function destroy(MenuItem $menuItem): Response
    {
        $this->authorize('delete', $menuItem);

        $menuItem->delete();

        return response()->noContent();
    }

    public function updateAvailability(UpdateMenuItemAvailabilityRequest $request, MenuItem $menuItem): JsonResponse
    {
        $menuItem->update([
            'is_available' => $request->boolean('is_available'),
        ]);

        return response()->json([
            'menu_item' => $menuItem->fresh(),
        ]);
    }
}
