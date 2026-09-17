<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Page;
use App\Models\Setting;
use App\Support\CmsDefaults;
use Illuminate\Http\JsonResponse;

class CmsController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $stored = Setting::map();
        $settings = [];

        foreach (CmsDefaults::settings() as $key => $default) {
            $value = $stored[$key] ?? $default;
            $settings[$key] = $value === '' ? $default : $value;
        }

        if (($stored['logo_url'] ?? '') === '') {
            $settings['logo_url'] = null;
        } else {
            $settings['logo_url'] = $stored['logo_url'];
        }

        $banners = Banner::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $pages = Page::query()
            ->where('is_published', true)
            ->orderBy('title')
            ->get(['slug', 'title']);

        return response()->json([
            'settings' => $settings,
            'banners' => $banners,
            'pages' => $pages,
        ]);
    }

    public function showPage(string $slug): JsonResponse
    {
        $page = Page::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json([
            'page' => $page,
        ]);
    }
}
