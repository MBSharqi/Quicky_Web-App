<?php

namespace App\Http\Requests\Shop;

use App\Models\MenuItem;
use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuItemAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var MenuItem $menuItem */
        $menuItem = $this->route('menu_item');

        return $this->user()->can('update', $menuItem);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'is_available' => ['required', 'boolean'],
        ];
    }
}
