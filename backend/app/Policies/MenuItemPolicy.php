<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\MenuItem;
use App\Models\User;

class MenuItemPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === Role::Shop && $user->shop !== null;
    }

    public function view(User $user, MenuItem $menuItem): bool
    {
        return $user->role === Role::Shop
            && $user->shop !== null
            && $menuItem->shop_id === $user->shop->id;
    }

    public function create(User $user): bool
    {
        return $user->role === Role::Shop && $user->shop !== null;
    }

    public function update(User $user, MenuItem $menuItem): bool
    {
        return $user->role === Role::Shop
            && $user->shop !== null
            && $menuItem->shop_id === $user->shop->id;
    }

    public function delete(User $user, MenuItem $menuItem): bool
    {
        return $this->update($user, $menuItem);
    }
}
