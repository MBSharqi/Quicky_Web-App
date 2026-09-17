<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GeocodeRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class GeocodeController extends Controller
{
    public function __invoke(GeocodeRequest $request): JsonResponse
    {
        $response = Http::withHeaders([
            'User-Agent' => 'QuickyLocalDelivery/1.0',
            'Accept' => 'application/json',
        ])->get('https://nominatim.openstreetmap.org/search', [
            'q' => $request->validated('query'),
            'format' => 'json',
            'limit' => 1,
        ]);

        if (! $response->successful()) {
            return response()->json([
                'message' => 'Unable to geocode address.',
            ], 502);
        }

        $result = $response->json()[0] ?? null;

        if (! $result) {
            return response()->json([
                'message' => 'No location found for that address.',
            ], 404);
        }

        return response()->json([
            'lat' => (float) $result['lat'],
            'lng' => (float) $result['lon'],
            'display_name' => $result['display_name'] ?? null,
        ]);
    }
}
