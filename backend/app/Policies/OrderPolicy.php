<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\Role;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [Role::Admin, Role::Customer, Role::Rider, Role::Shop], true);
    }

    public function view(User $user, Order $order): bool
    {
        return match ($user->role) {
            Role::Admin => true,
            Role::Customer => $order->customer_id === $user->id,
            Role::Rider => $order->rider_id === $user->id
                || $order->status === OrderStatus::ReadyForPickup,
            Role::Shop => $user->shop && $order->shop_id === $user->shop->id,
        };
    }

    public function create(User $user): bool
    {
        return $user->role === Role::Customer;
    }

    public function assign(User $user, Order $order): bool
    {
        if ($user->role !== Role::Admin) {
            return false;
        }

        if ($order->isShopOrder()) {
            return $order->status === OrderStatus::ReadyForPickup;
        }

        return $order->status === OrderStatus::Pending;
    }

    public function claim(User $user, Order $order): bool
    {
        return $user->role === Role::Rider
            && $order->status === OrderStatus::ReadyForPickup
            && $order->rider_id === null;
    }

    public function accept(User $user, Order $order): bool
    {
        return $this->ownsShopOrder($user, $order)
            && $order->status === OrderStatus::Pending;
    }

    public function reject(User $user, Order $order): bool
    {
        return $this->ownsShopOrder($user, $order)
            && $order->status === OrderStatus::Pending;
    }

    public function release(User $user, Order $order): bool
    {
        return $this->ownsShopOrder($user, $order)
            && $order->status === OrderStatus::Accepted;
    }

    public function updateStatus(User $user, Order $order): bool
    {
        return match ($user->role) {
            Role::Admin => ! in_array($order->status, [OrderStatus::Delivered, OrderStatus::Cancelled], true),
            Role::Rider => $order->rider_id === $user->id
                && in_array($order->status, [OrderStatus::Assigned, OrderStatus::PickedUp], true),
            Role::Customer => $order->customer_id === $user->id
                && $order->status === OrderStatus::Pending,
            Role::Shop => false,
        };
    }

    public function updatePayment(User $user, Order $order): bool
    {
        if ($order->payment_status === PaymentStatus::Paid) {
            return false;
        }

        if ($order->status === OrderStatus::Cancelled) {
            return false;
        }

        return match ($user->role) {
            Role::Admin => true,
            Role::Rider => $order->rider_id === $user->id
                && in_array($order->status, [OrderStatus::PickedUp, OrderStatus::Delivered], true),
            Role::Customer, Role::Shop => false,
        };
    }

    public function complete(User $user, Order $order): bool
    {
        if ($order->payment_status === PaymentStatus::Paid && $order->status === OrderStatus::Delivered) {
            return false;
        }

        if ($order->status === OrderStatus::Cancelled) {
            return false;
        }

        $isAssignee = match ($user->role) {
            Role::Admin => true,
            Role::Rider => $order->rider_id === $user->id,
            default => false,
        };

        if (! $isAssignee) {
            return false;
        }

        return in_array($order->status, [OrderStatus::PickedUp, OrderStatus::Delivered], true);
    }

    public function updateLocation(User $user, Order $order): bool
    {
        return $user->role === Role::Rider
            && $order->rider_id === $user->id
            && in_array($order->status, [OrderStatus::Assigned, OrderStatus::PickedUp], true);
    }

    private function ownsShopOrder(User $user, Order $order): bool
    {
        return $user->role === Role::Shop
            && $user->shop
            && $order->shop_id === $user->shop->id;
    }
}
