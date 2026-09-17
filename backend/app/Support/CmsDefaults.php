<?php

namespace App\Support;

class CmsDefaults
{
    /**
     * @return array<string, string>
     */
    public static function settings(): array
    {
        return [
            'brand_name' => 'Quicky',
            'logo_url' => '',
            'hero_kicker' => 'Quicky',
            'hero_title' => 'Local food & shops, delivered fast',
            'hero_subtitle' => 'Search restaurants, hotels, and shops near you. Add items to your cart and order with cash on delivery.',
            'search_placeholder' => 'Search shops, food, or city...',
            'search_button_label' => 'Search',
            'browse_title' => 'Open now',
            'browse_subtitle' => 'Browse available restaurants and shops',
            'empty_shops_title' => 'No shops found',
            'empty_shops_subtitle' => 'Try another search or check back soon.',
            'footer_text' => 'Quicky — local delivery marketplace',
        ];
    }

    /**
     * @return list<string>
     */
    public static function keys(): array
    {
        return array_keys(static::settings());
    }
}
