<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $invitations = Invitation::with('members')->get();

        $total = $invitations->count();
        $schools = $invitations->where('category', 'SMP')->count();
        $quota = $invitations->sum('quota');

        $registered = $invitations->reduce(function ($sum, $inv) {
            return $sum + ($inv->category === 'SMP' ? $inv->members->count() : $inv->quota);
        }, 0);

        $yes = $invitations->where('rsvp', 'Hadir')->count();
        $no = $invitations->where('rsvp', 'Tidak Hadir')->count();
        $pending = $invitations->where('rsvp', 'Pending')->count();
        $checked = $invitations->sum('checked');

        $categories = ['SMP', 'Guru', 'VIP', 'Orang Tua/Wali'];
        $byCategory = [];
        foreach ($categories as $cat) {
            $catInvitations = $invitations->where('category', $cat);
            $byCategory[$cat] = [
                'total' => $catInvitations->count(),
                'quota' => $catInvitations->sum('quota'),
                'checked' => $catInvitations->sum('checked'),
                'hadir' => $catInvitations->where('rsvp', 'Hadir')->count(),
            ];
        }

        $mouStatuses = [
            'Belum dijadwalkan',
            'Menunggu tanda tangan',
            'Sudah ditandatangani',
            'Perlu tindak lanjut',
        ];
        $mouStats = [];
        foreach ($mouStatuses as $st) {
            $mouStats[$st] = $invitations->where('mou', $st)->count();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'total' => $total,
                'schools' => $schools,
                'quota' => $quota,
                'registered' => $registered,
                'yes' => $yes,
                'no' => $no,
                'pending' => $pending,
                'checked' => $checked,
                'by_category' => $byCategory,
                'mou_stats' => $mouStats,
            ],
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        $invitations = Invitation::with('members')->orderBy('category')->orderBy('name')->get();

        $data = $invitations->map(function ($inv) {
            $attendanceStatus = $inv->checked === 0
                ? 'Belum check-in'
                : ($inv->checked === $inv->quota ? 'Hadir lengkap' : 'Hadir sebagian');

            return [
                'Kode Undangan' => $inv->code,
                'Nama' => $inv->name,
                'Kategori' => $inv->category,
                'Instansi / Asal' => $inv->institution,
                'Kepala Sekolah' => $inv->principal,
                'PIC / Kontak' => $inv->pic,
                'No. Telepon' => $inv->phone,
                'No. Kursi' => $inv->seat,
                'Kuota' => $inv->quota,
                'Jumlah Hadir' => $inv->checked,
                'Status Kehadiran' => $attendanceStatus,
                'Status RSVP' => $inv->rsvp,
                'Status MOU' => $inv->mou,
                'Tanggal MOU' => $inv->mou_date,
                'Penandatangan' => $inv->signer,
                'Nama Siswa' => $inv->student,
                'Daftar Anggota' => $inv->members->pluck('name')->implode(', '),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
