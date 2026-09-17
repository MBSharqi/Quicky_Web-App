<?php

namespace App\Http\Requests;

use App\Enums\OrderStatus;
use App\Enums\Role;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Order $order */
        $order = $this->route('order');

        return $this->user()->can('updateStatus', $order);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Order $order */
        $order = $this->route('order');
        $user = $this->user();

        $allowed = match ($user->role) {
            Role::Admin => match ($order->status) {
                OrderStatus::Pending, OrderStatus::Accepted, OrderStatus::ReadyForPickup => [OrderStatus::Cancelled->value],
                OrderStatus::Assigned => [OrderStatus::PickedUp->value, OrderStatus::Cancelled->value],
                OrderStatus::PickedUp => [OrderStatus::Delivered->value],
                default => [],
            },
            Role::Rider => match ($order->status) {
                OrderStatus::Assigned => [OrderStatus::PickedUp->value],
                OrderStatus::PickedUp => [OrderStatus::Delivered->value],
                default => [],
            },
            Role::Customer => match ($order->status) {
                OrderStatus::Pending => [OrderStatus::Cancelled->value],
                default => [],
            },
            default => [],
        };

        return [
            'status' => ['required', Rule::in($allowed)],
        ];
    }
}
