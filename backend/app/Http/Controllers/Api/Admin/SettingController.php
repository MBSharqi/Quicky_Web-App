<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\CmsDefaults;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function show(): JsonResponse
    {
        $stored = Setting::map();
        $settings = [];

        foreach (CmsDefaults::settings() as $key => $default) {
            $settings[$key] = array_key_exists($key, $stored) ? $stored[$key] : $default;
        }

        return response()->json([
            'settings' => $settings,
            'defaults' => CmsDefaults::settings(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.brand_name' => ['required', 'string', 'max:100'],
            'settings.logo_url' => ['nullable', 'string', 'max:2048'],
            'settings.hero_kicker' => ['required', 'string', 'max:100'],
            'settings.hero_title' => ['required', 'string', 'max:255'],
            'settings.hero_subtitle' => ['required', 'string', 'max:1000'],
            'settings.search_placeholder' => ['required', 'string', 'max:255'],
            'settings.search_button_label' => ['required', 'string', 'max:50'],
            'settings.browse_title' => ['required', 'string', 'max:255'],
            'settings.browse_subtitle' => ['required', 'string', 'max:255'],
            'settings.empty_shops_title' => ['required', 'string', 'max:255'],
            'settings.empty_shops_subtitle' => ['required', 'string', 'max:255'],
            'settings.footer_text' => ['nullable', 'string', 'max:255'],
        ]);

        $payload = [];
        foreach (CmsDefaults::keys() as $key) {
            if (array_key_exists($key, $validated['settings'])) {
                $value = $validated['settings'][$key];
                $payload[$key] = is_string($value) ? trim($value) : $value;
            }
        }

        Setting::putMany($payload);

        return $this->show();
    }
}
