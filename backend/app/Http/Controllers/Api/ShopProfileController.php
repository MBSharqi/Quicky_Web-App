<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateShopStatusRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShopProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $shop = $request->user()->shop;

        abort_if($shop === null, 404, 'Shop profile not found.');

        $this->authorize('view', $shop);

        $shop->load(['owner:id,name,email']);

        return response()->json([
            'shop' => $shop,
        ]);
    }

    public function updateStatus(UpdateShopStatusRequest $request): JsonResponse
    {
        $shop = $request->user()->shop;

        abort_if($shop === null, 404, 'Shop profile not found.');

        $shop->update([
            'is_open' => $request->boolean('is_open'),
        ]);

        $shop->load(['owner:id,name,email']);

        return response()->json([
            'shop' => $shop,
        ]);
    }
}
