<?php

namespace App\Http\Requests;

use App\Enums\PaymentMethod;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Order::class);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'pickup_address' => ['required', 'string', 'max:255'],
            'pickup_city' => ['required', 'string', 'max:100'],
            'pickup_lat' => ['required', 'numeric', 'between:-90,90'],
            'pickup_lng' => ['required', 'numeric', 'between:-180,180'],
            'pickup_contact_name' => ['required', 'string', 'max:255'],
            'pickup_contact_phone' => ['required', 'string', 'max:30'],
            'dropoff_address' => ['required', 'string', 'max:255'],
            'dropoff_city' => ['required', 'string', 'max:100'],
            'dropoff_lat' => ['required', 'numeric', 'between:-90,90'],
            'dropoff_lng' => ['required', 'numeric', 'between:-180,180'],
            'dropoff_contact_name' => ['required', 'string', 'max:255'],
            'dropoff_contact_phone' => ['required', 'string', 'max:30'],
            'package_description' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'delivery_fee' => ['required', 'numeric', 'min:0', 'max:999999.99'],
        ];
    }
}
