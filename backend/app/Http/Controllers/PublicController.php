<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Invitation;
use App\Models\Member;
use App\Models\Message;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PublicController extends Controller
{
    public function getInvitation(string $code): JsonResponse
    {
        $invitation = Invitation::with('members')
            ->where('code', $code)
            ->first();

        if (! $invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan dengan kode tersebut tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $invitation,
        ]);
    }

    public function submitRsvp(Request $request, string $code): JsonResponse
    {
        $invitation = Invitation::where('code', $code)->first();

        if (! $invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'rsvp' => 'required|in:Pending,Hadir,Tidak Hadir',
            'phone' => 'nullable|string',
            'pic' => 'nullable|string',
        ]);

        $invitation->rsvp = $validated['rsvp'];
        if (! empty($validated['phone'])) {
            $invitation->phone = $validated['phone'];
        }
        if (! empty($validated['pic'])) {
            $invitation->pic = $validated['pic'];
        }
        $invitation->save();

        $actionText = match ($validated['rsvp']) {
            'Hadir' => 'mengonfirmasi kehadiran',
            'Tidak Hadir' => 'mengonfirmasi tidak dapat hadir',
            default => 'memperbarui status RSVP',
        };

        Activity::create([
            'text' => "{$invitation->name} {$actionText}",
            'time' => now()->format('H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Konfirmasi RSVP berhasil disimpan.',
            'data' => $invitation->fresh('members'),
        ]);
    }

    public function updateSchoolMembers(Request $request, string $code): JsonResponse
    {
        $invitation = Invitation::with('members')->where('code', $code)->first();

        if (! $invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan sekolah tidak ditemukan.',
            ], 404);
        }

        if ($invitation->category !== 'SMP') {
            return response()->json([
                'success' => false,
                'message' => 'Fitur ini khusus untuk perwakilan sekolah SMP.',
            ], 403);
        }

        $validated = $request->validate([
            'members' => 'required|array',
            'members.*.name' => 'required|string',
            'members.*.role' => 'nullable|string',
            'pic' => 'nullable|string',
            'phone' => 'nullable|string',
            'principal' => 'nullable|string',
        ]);

        if (count($validated['members']) > $invitation->quota) {
            return response()->json([
                'success' => false,
                'message' => "Jumlah anggota melebihi kuota undangan ({$invitation->quota} peserta).",
            ], 422);
        }

        if (! empty($validated['pic'])) $invitation->pic = $validated['pic'];
        if (! empty($validated['phone'])) $invitation->phone = $validated['phone'];
        if (! empty($validated['principal'])) $invitation->principal = $validated['principal'];
        $invitation->save();

        $existingIds = [];
        foreach ($validated['members'] as $m) {
            $memberId = $m['id'] ?? (string) Str::uuid();
            $existingIds[] = $memberId;

            Member::updateOrCreate(
                ['id' => $memberId],
                [
                    'invitation_id' => $invitation->id,
                    'name' => $m['name'],
                    'role' => $m['role'] ?? 'Siswa',
                    'present' => $m['present'] ?? false,
                ]
            );
        }

        // Delete removed members
        Member::where('invitation_id', $invitation->id)
            ->whereNotIn('id', $existingIds)
            ->delete();

        Activity::create([
            'text' => "{$invitation->name} memperbarui daftar peserta",
            'time' => now()->format('H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Daftar peserta sekolah berhasil diperbarui.',
            'data' => $invitation->fresh('members'),
        ]);
    }

    public function getPublicData(): JsonResponse
    {
        $settings = Setting::first();
        $messages = Message::orderBy('created_at', 'desc')->take(30)->get();
        $activities = Activity::orderBy('created_at', 'desc')->take(20)->get();

        return response()->json([
            'success' => true,
            'settings' => $settings,
            'messages' => $messages,
            'activities' => $activities,
        ]);
    }
}
