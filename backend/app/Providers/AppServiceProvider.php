<?php

namespace App\Providers;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::define('access-admin', fn (User $user): bool => $user->role === Role::Admin);
        Gate::define('access-rider', fn (User $user): bool => $user->role === Role::Rider);
        Gate::define('access-customer', fn (User $user): bool => $user->role === Role::Customer);
    }
}
