<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Enums\ShopType;
use App\Models\MenuItem;
use App\Models\Shop;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@quicky.test'],
            ['name' => 'Admin', 'password' => 'password', 'role' => Role::Admin]
        );

        User::query()->updateOrCreate(
            ['email' => 'rider@quicky.test'],
            ['name' => 'Rider', 'password' => 'password', 'role' => Role::Rider]
        );

        User::query()->updateOrCreate(
            ['email' => 'customer@quicky.test'],
            ['name' => 'Customer', 'password' => 'password', 'role' => Role::Customer]
        );

        $shopOwner = User::query()->updateOrCreate(
            ['email' => 'shop@quicky.test'],
            ['name' => 'Demo Restaurant Owner', 'password' => 'password', 'role' => Role::Shop]
        );

        $shop = Shop::query()->updateOrCreate(
            ['user_id' => $shopOwner->id],
            [
                'name' => 'Quicky Kitchen',
                'slug' => 'quicky-kitchen',
                'type' => ShopType::Restaurant,
                'description' => 'Demo restaurant for Phase 1 shop dashboard.',
                'address' => '12 Clifton Block 5',
                'city' => 'Karachi',
                'lat' => 24.8138,
                'lng' => 67.0299,
                'phone' => '03001234567',
                'is_open' => true,
            ]
        );

        $demoItems = [
            [
                'name' => 'Chicken Biryani',
                'category' => 'Main course',
                'description' => 'Spiced basmati rice with tender chicken.',
                'price' => 450,
                'sort_order' => 1,
            ],
            [
                'name' => 'Beef Burger',
                'category' => 'Fast food',
                'description' => 'Grilled beef patty with cheese and sauce.',
                'price' => 550,
                'sort_order' => 2,
            ],
            [
                'name' => 'Fresh Lemonade',
                'category' => 'Drinks',
                'description' => 'Chilled lemonade with mint.',
                'price' => 180,
                'sort_order' => 3,
            ],
        ];

        foreach ($demoItems as $item) {
            MenuItem::query()->updateOrCreate(
                [
                    'shop_id' => $shop->id,
                    'name' => $item['name'],
                ],
                [
                    ...$item,
                    'is_available' => true,
                ]
            );
        }

        $this->call(CmsSeeder::class);
    }
}
