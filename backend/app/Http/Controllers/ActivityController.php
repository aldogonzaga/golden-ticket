<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(): JsonResponse
    {
        $activities = Activity::orderBy('created_at', 'desc')->take(30)->get();

        return response()->json([
            'success' => true,
            'data' => $activities,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => 'required|string|max:255',
            'time' => 'nullable|string|max:50',
        ]);

        $activity = Activity::create([
            'text' => $validated['text'],
            'time' => $validated['time'] ?? now()->format('H:i'),
        ]);

        return response()->json([
            'success' => true,
            'data' => $activity,
        ], 201);
    }
}
