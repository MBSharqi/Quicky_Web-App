<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class BannerController extends Controller
{
    public function index(): JsonResponse
    {
        $banners = Banner::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'banners' => $banners,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $banner = Banner::create($this->validated($request));

        return response()->json([
            'banner' => $banner,
        ], 201);
    }

    public function show(Banner $banner): JsonResponse
    {
        return response()->json([
            'banner' => $banner,
        ]);
    }

    public function update(Request $request, Banner $banner): JsonResponse
    {
        $banner->update($this->validated($request, false));

        return response()->json([
            'banner' => $banner->fresh(),
        ]);
    }

    public function destroy(Banner $banner): Response
    {
        $banner->delete();

        return response()->noContent();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, bool $creating = true): array
    {
        $rules = [
            'title' => [$creating ? 'required' : 'sometimes', 'required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:500'],
            'image_url' => ['nullable', 'string', 'max:2048'],
            'link_url' => ['nullable', 'string', 'max:2048'],
            'cta_label' => ['nullable', 'string', 'max:80'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0', 'max:9999'],
        ];

        $validated = $request->validate($rules);

        if ($creating) {
            $validated['is_active'] = $request->boolean('is_active', true);
            $validated['sort_order'] = $request->integer('sort_order', 0);
        }

        return $validated;
    }
}
