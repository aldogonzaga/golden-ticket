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
        $remainingQuota = $invitation->quota - $invitation->checked;

        if ($remainingQuota <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Kuota tiket sudah penuh / sudah check-in lengkap sebelumnya.',
            ], 422);
        }

        if ($invitation->category === 'SMP') {
            if (! empty($memberIds)) {
                $unpresentMembers = $invitation->members
                    ->whereIn('id', $memberIds)
                    ->where('present', false);

                $added = $unpresentMembers->count();

                if ($added === 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Anggota yang dipilih sudah check-in sebelumnya.',
                    ], 422);
                }

                Member::whereIn('id', $unpresentMembers->pluck('id'))
                    ->update(['present' => true]);
            } else {
                // Check in all unpresent members if any, or check in the remaining quota
                $unpresentCount = $invitation->members()->where('present', false)->count();
                $invitation->members()->where('present', false)->update(['present' => true]);

                $added = $unpresentCount > 0
                    ? min($unpresentCount, $remainingQuota)
                    : min($validated['count'] ?? $remainingQuota, $remainingQuota);

                // Auto-create delegate members in DB if members count is less than checked + added
                $existingCount = $invitation->members()->count();
                $targetCount = min($invitation->checked + $added, $invitation->quota);
                if ($existingCount < $targetCount) {
                    for ($idx = $existingCount + 1; $idx <= $targetCount; $idx++) {
                        $isLeader = ($idx === 1 && !empty(trim($invitation->principal ?? '')));
                        $invitation->members()->create([
                            'name' => $isLeader ? "{$invitation->principal} (Kepala Sekolah)" : "Delegasi / Siswa {$idx}",
                            'role' => $isLeader ? 'Kepala Sekolah' : 'Siswa',
                            'present' => true,
                        ]);
                    }
                }
            }

            if ($invitation->checked + $added > $invitation->quota) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jumlah hadir melebihi kuota.',
                ], 422);
            }

            $invitation->checked += $added;
            $invitation->save();
        } else {
            $added = min($validated['count'] ?? $remainingQuota, $remainingQuota);

            if ($added <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jumlah hadir tidak valid atau kuota sudah penuh.',
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
