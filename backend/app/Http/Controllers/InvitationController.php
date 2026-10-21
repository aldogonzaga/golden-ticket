<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Invitation;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Invitation::with('members')->orderBy('created_at', 'desc');

        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                  ->orWhere('code', 'like', $term)
                  ->orWhere('institution', 'like', $term)
                  ->orWhere('principal', 'like', $term)
                  ->orWhere('pic', 'like', $term)
                  ->orWhere('student', 'like', $term)
                  ->orWhere('phone', 'like', $term)
                  ->orWhere('seat', 'like', $term);
            });
        }

        if ($request->filled('rsvp') && $request->rsvp !== 'all') {
            $query->where('rsvp', $request->rsvp);
        }

        if ($request->filled('mou') && $request->mou !== 'all') {
            $query->where('mou', $request->mou);
        }

        if ($request->filled('attendance')) {
            if ($request->attendance === 'unattended') {
                $query->where('checked', 0);
            } elseif ($request->attendance === 'partial') {
                $query->where('checked', '>', 0)->whereColumn('checked', '<', 'quota');
            } elseif ($request->attendance === 'complete') {
                $query->whereColumn('checked', '>=', 'quota');
            }
        }

        $invitations = $query->get();

        return response()->json([
            'success' => true,
            'data' => $invitations,
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $invitation = Invitation::with('members')
            ->where('id', $id)
            ->orWhere('code', $id)
            ->first();

        if (! $invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $invitation,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'nullable|string',
            'code' => 'nullable|string',
            'name' => 'required|string|max:255',
            'category' => 'required|in:SMP,Guru,VIP,Orang Tua/Wali',
            'institution' => 'nullable|string',
            'principal' => 'nullable|string',
            'pic' => 'nullable|string',
            'phone' => 'nullable|string',
            'quota' => 'required|integer|min:1',
            'seat' => 'nullable|string',
            'rsvp' => 'nullable|in:Pending,Hadir,Tidak Hadir',
            'checked' => 'nullable|integer|min:0',
            'mou' => 'nullable|string',
            'mouDate' => 'nullable|string',
            'mou_date' => 'nullable|string',
            'signer' => 'nullable|string',
            'note' => 'nullable|string',
            'student' => 'nullable|string',
            'title' => 'nullable|string',
            'relationship' => 'nullable|string',
            'vipLevel' => 'nullable|string',
            'vip_level' => 'nullable|string',
            'cancelled' => 'nullable|boolean',
            'members' => 'nullable|array',
            'members.*.name' => 'required|string',
            'members.*.role' => 'nullable|string',
            'members.*.present' => 'nullable|boolean',
        ]);

        if ($validated['category'] === 'SMP') {
            if ($validated['quota'] > 10) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kuota untuk kategori SMP maksimal 10.',
                ], 422);
            }
            if (empty(trim($validated['principal'] ?? ''))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nama kepala sekolah wajib diisi untuk kategori SMP.',
                ], 422);
            }
        }

        $invitation = new Invitation();
        if (! empty($validated['id'])) {
            $invitation->id = $validated['id'];
        }
        if (! empty($validated['code'])) {
            $invitation->code = $validated['code'];
        }

        $invitation->name = $validated['name'];
        $invitation->category = $validated['category'];
        $invitation->institution = $validated['institution'] ?? '';
        $invitation->principal = $validated['principal'] ?? '';
        $invitation->pic = $validated['pic'] ?? '';
        $invitation->phone = $validated['phone'] ?? '';
        $invitation->quota = $validated['quota'];
        $invitation->seat = $validated['seat'] ?? '';
        $invitation->rsvp = $validated['rsvp'] ?? 'Pending';
        $invitation->checked = $validated['checked'] ?? 0;
        $invitation->mou = $validated['mou'] ?? 'Belum dijadwalkan';
        $invitation->mou_date = $validated['mouDate'] ?? $validated['mou_date'] ?? '';
        $invitation->signer = $validated['signer'] ?? '';
        $invitation->note = $validated['note'] ?? '';
        $invitation->student = $validated['student'] ?? '';
        $invitation->title = $validated['title'] ?? '';
        $invitation->relationship = $validated['relationship'] ?? 'Ayah';
        $invitation->vip_level = $validated['vipLevel'] ?? $validated['vip_level'] ?? 'VIP';
        $invitation->cancelled = $validated['cancelled'] ?? false;
        $invitation->save();

        if (! empty($validated['members'])) {
            foreach ($validated['members'] as $m) {
                Member::create([
                    'id' => $m['id'] ?? (string) Str::uuid(),
                    'invitation_id' => $invitation->id,
                    'name' => $m['name'],
                    'role' => $m['role'] ?? 'Siswa',
                    'present' => $m['present'] ?? false,
                ]);
            }
        }

        Activity::create([
            'text' => "Undangan {$invitation->name} dibuat",
            'time' => now()->format('H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Undangan berhasil dibuat.',
            'data' => $invitation->load('members'),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $invitation = Invitation::where('id', $id)->orWhere('code', $id)->first();

        if (! $invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|in:SMP,Guru,VIP,Orang Tua/Wali',
            'institution' => 'nullable|string',
            'principal' => 'nullable|string',
            'pic' => 'nullable|string',
            'phone' => 'nullable|string',
            'quota' => 'sometimes|required|integer|min:1',
            'seat' => 'nullable|string',
            'rsvp' => 'nullable|in:Pending,Hadir,Tidak Hadir',
            'checked' => 'nullable|integer|min:0',
            'mou' => 'nullable|string',
            'mouDate' => 'nullable|string',
            'mou_date' => 'nullable|string',
            'signer' => 'nullable|string',
            'note' => 'nullable|string',
            'student' => 'nullable|string',
            'title' => 'nullable|string',
            'relationship' => 'nullable|string',
            'vipLevel' => 'nullable|string',
            'vip_level' => 'nullable|string',
            'cancelled' => 'nullable|boolean',
            'members' => 'nullable|array',
        ]);

        $category = $validated['category'] ?? $invitation->category;
        $quota = $validated['quota'] ?? $invitation->quota;

        if ($category === 'SMP') {
            if ($quota > 10) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kuota untuk kategori SMP maksimal 10.',
                ], 422);
            }
            $principal = $validated['principal'] ?? $invitation->principal;
            if (empty(trim($principal ?? ''))) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nama kepala sekolah wajib diisi untuk kategori SMP.',
                ], 422);
            }
        }

        if (isset($validated['name'])) $invitation->name = $validated['name'];
        if (isset($validated['category'])) $invitation->category = $validated['category'];
        if (array_key_exists('institution', $validated)) $invitation->institution = $validated['institution'] ?? '';
        if (array_key_exists('principal', $validated)) $invitation->principal = $validated['principal'] ?? '';
        if (array_key_exists('pic', $validated)) $invitation->pic = $validated['pic'] ?? '';
        if (array_key_exists('phone', $validated)) $invitation->phone = $validated['phone'] ?? '';
        if (isset($validated['quota'])) $invitation->quota = $validated['quota'];
        if (array_key_exists('seat', $validated)) $invitation->seat = $validated['seat'] ?? '';
        if (isset($validated['rsvp'])) $invitation->rsvp = $validated['rsvp'];
        if (isset($validated['checked'])) $invitation->checked = $validated['checked'];
        if (array_key_exists('mou', $validated)) $invitation->mou = $validated['mou'] ?? 'Belum dijadwalkan';
        if (array_key_exists('mouDate', $validated) || array_key_exists('mou_date', $validated)) {
            $invitation->mou_date = $validated['mouDate'] ?? $validated['mou_date'] ?? '';
        }
        if (array_key_exists('signer', $validated)) $invitation->signer = $validated['signer'] ?? '';
        if (array_key_exists('note', $validated)) $invitation->note = $validated['note'] ?? '';
        if (array_key_exists('student', $validated)) $invitation->student = $validated['student'] ?? '';
        if (array_key_exists('title', $validated)) $invitation->title = $validated['title'] ?? '';
        if (array_key_exists('relationship', $validated)) $invitation->relationship = $validated['relationship'] ?? 'Ayah';
        if (array_key_exists('vipLevel', $validated) || array_key_exists('vip_level', $validated)) {
            $invitation->vip_level = $validated['vipLevel'] ?? $validated['vip_level'] ?? 'VIP';
        }
        if (isset($validated['cancelled'])) $invitation->cancelled = (bool) $validated['cancelled'];

        $invitation->save();

        // Handle members syncing if passed
        if (isset($validated['members'])) {
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
            // Remove members that were deleted
            Member::where('invitation_id', $invitation->id)
                ->whereNotIn('id', $existingIds)
                ->delete();
        }

        Activity::create([
            'text' => "Undangan {$invitation->name} diperbarui",
            'time' => now()->format('H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Undangan berhasil diperbarui.',
            'data' => $invitation->load('members'),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $invitation = Invitation::where('id', $id)->orWhere('code', $id)->first();

        if (! $invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Undangan tidak ditemukan.',
            ], 404);
        }

        $name = $invitation->name;
        $invitation->delete();

        Activity::create([
            'text' => "Undangan {$name} dihapus",
            'time' => now()->format('H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Undangan berhasil dihapus.',
        ]);
    }

    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.name' => 'required|string',
            'items.*.category' => 'required|in:SMP,Guru,VIP,Orang Tua/Wali',
        ]);

        $imported = 0;
        foreach ($request->input('items') as $item) {
            $id = $item['id'] ?? (string) Str::uuid();
            $code = $item['code'] ?? null;

            $invitation = Invitation::updateOrCreate(
                ['id' => $id],
                [
                    'code' => $code ?? ("GCP-" . match ($item['category']) {
                        'Guru' => 'GR',
                        'VIP' => 'VIP',
                        'Orang Tua/Wali' => 'ORT',
                        default => 'SMP',
                    } . "-" . strtoupper(substr(str_replace('-', '', (string) Str::uuid()), 0, 5))),
                    'name' => $item['name'],
                    'category' => $item['category'],
                    'institution' => $item['institution'] ?? '',
                    'principal' => $item['principal'] ?? '',
                    'pic' => $item['pic'] ?? '',
                    'phone' => $item['phone'] ?? '',
                    'quota' => $item['quota'] ?? 10,
                    'seat' => $item['seat'] ?? '',
                    'rsvp' => $item['rsvp'] ?? 'Pending',
                    'checked' => $item['checked'] ?? 0,
                    'mou' => $item['mou'] ?? 'Belum dijadwalkan',
                    'mou_date' => $item['mouDate'] ?? $item['mou_date'] ?? '',
                    'signer' => $item['signer'] ?? '',
                    'note' => $item['note'] ?? '',
                    'student' => $item['student'] ?? '',
                    'title' => $item['title'] ?? '',
                    'relationship' => $item['relationship'] ?? 'Ayah',
                    'vip_level' => $item['vipLevel'] ?? $item['vip_level'] ?? 'VIP',
                    'cancelled' => $item['cancelled'] ?? false,
                ]
            );

            if (! empty($item['members']) && is_array($item['members'])) {
                foreach ($item['members'] as $m) {
                    Member::updateOrCreate(
                        ['id' => $m['id'] ?? (string) Str::uuid()],
                        [
                            'invitation_id' => $invitation->id,
                            'name' => $m['name'],
                            'role' => $m['role'] ?? 'Siswa',
                            'present' => $m['present'] ?? false,
                        ]
                    );
                }
            }

            $imported++;
        }

        Activity::create([
            'text' => "{$imported} data undangan berhasil diimpor",
            'time' => now()->format('H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => "{$imported} data undangan berhasil diimpor.",
            'count' => $imported,
        ]);
    }
}
