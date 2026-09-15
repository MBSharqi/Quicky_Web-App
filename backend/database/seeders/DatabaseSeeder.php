<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@quicky.test',
            'password' => 'password',
        ]);

        User::factory()->rider()->create([
            'name' => 'Rider',
            'email' => 'rider@quicky.test',
            'password' => 'password',
        ]);

        User::factory()->customer()->create([
            'name' => 'Customer',
            'email' => 'customer@quicky.test',
            'password' => 'password',
        ]);
    }
}
