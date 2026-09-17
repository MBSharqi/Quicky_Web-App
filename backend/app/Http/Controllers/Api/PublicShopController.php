<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicShopController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('q', ''));

        $shops = Shop::query()
            ->where('is_open', true)
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhere('type', 'like', "%{$search}%")
                        ->orWhereHas('menuItems', function ($items) use ($search) {
                            $items->where('is_available', true)
                                ->where(function ($itemQuery) use ($search) {
                                    $itemQuery->where('name', 'like', "%{$search}%")
                                        ->orWhere('category', 'like', "%{$search}%");
                                });
                        });
                });
            })
            ->withCount([
                'menuItems as available_items_count' => fn ($query) => $query->where('is_available', true),
            ])
            ->latest()
            ->paginate(12);

        return response()->json($shops);
    }

    public function show(string $slug): JsonResponse
    {
        $shop = Shop::query()
            ->where('slug', $slug)
            ->with([
                'menuItems' => fn ($query) => $query->where('is_available', true),
            ])
            ->firstOrFail();

        return response()->json([
            'shop' => $shop,
        ]);
    }
}
