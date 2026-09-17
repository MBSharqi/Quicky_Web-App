<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Shop;
use App\Models\User;

class ShopPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === Role::Admin;
    }

    public function view(User $user, Shop $shop): bool
    {
        return $user->role === Role::Admin
            || ($user->role === Role::Shop && $shop->user_id === $user->id);
    }

    public function create(User $user): bool
    {
        return $user->role === Role::Admin;
    }

    public function update(User $user, Shop $shop): bool
    {
        return $user->role === Role::Admin
            || ($user->role === Role::Shop && $shop->user_id === $user->id);
    }

    public function updateStatus(User $user, Shop $shop): bool
    {
        return $user->role === Role::Shop && $shop->user_id === $user->id;
    }
}
