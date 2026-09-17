<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Setting extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'value',
    ];

    public static function getValue(string $key, ?string $default = null): ?string
    {
        $all = static::map();

        return array_key_exists($key, $all) ? $all[$key] : $default;
    }

    /**
     * @return array<string, string|null>
     */
    public static function map(): array
    {
        return Cache::remember('cms.settings', 60, function () {
            return static::query()
                ->pluck('value', 'key')
                ->all();
        });
    }

    /**
     * @param  array<string, string|null>  $values
     */
    public static function putMany(array $values): void
    {
        foreach ($values as $key => $value) {
            static::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        Cache::forget('cms.settings');
    }
}
