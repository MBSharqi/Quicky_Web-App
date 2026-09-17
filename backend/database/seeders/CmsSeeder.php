<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Page;
use App\Models\Setting;
use App\Support\CmsDefaults;
use Illuminate\Database\Seeder;

class CmsSeeder extends Seeder
{
    public function run(): void
    {
        Setting::putMany(CmsDefaults::settings());

        Banner::query()->updateOrCreate(
            ['title' => 'Order local favorites'],
            [
                'subtitle' => 'COD delivery from restaurants and shops near you.',
                'image_url' => null,
                'link_url' => '/',
                'cta_label' => 'Browse shops',
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        Banner::query()->updateOrCreate(
            ['title' => 'Shops open now'],
            [
                'subtitle' => 'Fresh menus updated by local merchants every day.',
                'image_url' => null,
                'link_url' => '/',
                'cta_label' => 'Start ordering',
                'is_active' => true,
                'sort_order' => 2,
            ]
        );

        Page::query()->updateOrCreate(
            ['slug' => 'about'],
            [
                'title' => 'About Quicky',
                'body' => "Quicky connects local restaurants, shops, and hotels with nearby customers.\n\nAdmins register merchants, shops manage menus, and riders deliver COD orders across your city.",
                'is_published' => true,
            ]
        );
    }
}
