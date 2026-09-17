<?php

namespace App\Http\Requests\Admin;

use App\Enums\ShopType;
use App\Models\Shop;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateShopRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Shop $shop */
        $shop = $this->route('shop');

        return $this->user()->can('update', $shop);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'type' => ['sometimes', 'required', Rule::enum(ShopType::class)],
            'description' => ['nullable', 'string', 'max:2000'],
            'address' => ['sometimes', 'required', 'string', 'max:255'],
            'city' => ['sometimes', 'required', 'string', 'max:100'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'phone' => ['nullable', 'string', 'max:30'],
            'logo_url' => ['nullable', 'url', 'max:2048'],
            'is_open' => ['sometimes', 'boolean'],
        ];
    }
}
