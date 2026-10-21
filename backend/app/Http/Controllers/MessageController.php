<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(): JsonResponse
    {
        $messages = Message::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'text' => 'required|string|max:1000',
            'category' => 'nullable|string|max:100',
        ]);

        $message = Message::create([
            'name' => $validated['name'],
            'text' => $validated['text'],
            'category' => $validated['category'] ?? 'Tamu',
        ]);

        Activity::create([
            'text' => "Pesan baru dari {$message->name}",
            'time' => now()->format('H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil dikirim.',
            'data' => $message,
        ], 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $message = Message::findOrFail($id);
        $message->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil dihapus.',
        ]);
    }
}
