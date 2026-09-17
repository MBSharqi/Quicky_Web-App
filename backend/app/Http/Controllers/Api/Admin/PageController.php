<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class PageController extends Controller
{
    public function index(): JsonResponse
    {
        $pages = Page::query()->orderBy('title')->get();

        return response()->json([
            'pages' => $pages,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validated($request);

        $page = Page::create($validated);

        return response()->json([
            'page' => $page,
        ], 201);
    }

    public function show(Page $page): JsonResponse
    {
        return response()->json([
            'page' => $page,
        ]);
    }

    public function update(Request $request, Page $page): JsonResponse
    {
        $page->update($this->validated($request, $page));

        return response()->json([
            'page' => $page->fresh(),
        ]);
    }

    public function destroy(Page $page): Response
    {
        $page->delete();

        return response()->noContent();
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?Page $page = null): array
    {
        $creating = $page === null;

        $validated = $request->validate([
            'title' => [$creating ? 'required' : 'sometimes', 'required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('pages', 'slug')->ignore($page?->id),
            ],
            'body' => ['nullable', 'string'],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        if ($creating) {
            $validated['is_published'] = $request->boolean('is_published', true);
        } elseif ($request->has('is_published')) {
            $validated['is_published'] = $request->boolean('is_published');
        }

        return $validated;
    }
}
