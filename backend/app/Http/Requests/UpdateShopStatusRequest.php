<?php

namespace App\Http\Requests;

use App\Models\Shop;
use Illuminate\Foundation\Http\FormRequest;

class UpdateShopStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $shop = $this->user()?->shop;

        return $shop !== null && $this->user()->can('updateStatus', $shop);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'is_open' => ['required', 'boolean'],
        ];
    }
}
