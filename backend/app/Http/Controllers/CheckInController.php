<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Invitation;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckInController extends Controller
{
    public function verify(string $identifier): JsonResponse
    {
        $invitation = Invitation::with('members')
            ->where('code', $identifier)
            ->orWhere('id', $identifier)
            ->first();

        if (! $invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Tiket/undangan tidak ditemukan.',
            ], 404);
        }

        if ($invitation->cancelled) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan telah dibatalkan.',
                'data' => $invitation,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => $invitation,
        ]);
    }

    public function checkIn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'nullable|string',
            'code' => 'nullable|string',
            'member_ids' => 'nullable|array',
            'member_ids.*' => 'string',
            'count' => 'nullable|integer|min:1',
        ]);

        $identifier = $validated['id'] ?? $validated['code'] ?? null;

        if (! $identifier) {
            return response()->json([
                'success' => false,
                'message' => 'ID atau kode undangan harus disertakan.',
            ], 422);
        }

        $invitation = Invitation::with('members')
            ->where('id', $identifier)
            ->orWhere('code', $identifier)
            ->first();

        if (! $invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan tidak ditemukan.',
            ], 404);
        }

        if ($invitation->cancelled) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan telah dibatalkan.',
            ], 422);
        }

        $memberIds = $validated['member_ids'] ?? [];
        $count = $validated['count'] ?? 1;

        if ($invitation->category === 'SMP') {
            $unpresentMembers = $invitation->members
                ->whereIn('id', $memberIds)
                ->where('present', false);

            $added = $unpresentMembers->count();

            if ($added === 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sudah check-in atau belum ada peserta dipilih.',
                ], 422);
            }

            if ($invitation->checked + $added > $invitation->quota) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jumlah hadir melebihi kuota.',
                ], 422);
            }

            Member::whereIn('id', $unpresentMembers->pluck('id'))
                ->update(['present' => true]);

            $invitation->checked += $added;
            $invitation->save();
        } else {
            $added = $count;

            if ($invitation->checked + $added > $invitation->quota) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jumlah hadir melebihi kuota.',
                ], 422);
            }

            $invitation->checked += $added;
            $invitation->save();
        }

        Activity::create([
            'text' => "{$invitation->name} · {$added} peserta berhasil check-in",
            'time' => now()->format('H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$added} peserta berhasil check-in.",
            'added' => $added,
            'data' => $invitation->fresh('members'),
        ]);
    }
}
