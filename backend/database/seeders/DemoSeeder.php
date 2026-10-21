<?php

namespace Database\Seeders;

use App\Models\Activity;
use App\Models\Invitation;
use App\Models\Member;
use App\Models\Message;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $mouStatuses = [
            'Belum dijadwalkan',
            'Menunggu tanda tangan',
            'Sudah ditandatangani',
            'Perlu tindak lanjut',
        ];

        $schools = [
            'SMP Negeri 1 Cibitung',
            'SMP Negeri 2 Cibitung',
            'SMP Negeri 3 Tambun Selatan',
            'SMP Islam Al Azhar 9',
            'SMP Negeri 1 Cikarang Barat',
        ];

        $principals = [
            'Drs. Budi Santoso, M.Pd.',
            'Dra. Siti Rahmawati, M.Pd.',
            'Drs. Ahmad Hidayat',
            'Dra. Ratna Wulandari',
            'Drs. Dedi Supriyadi',
        ];

        $pics = [
            'Ani Wulandari',
            'Dewi Lestari',
            'Agus Setiawan',
            'Rina Handayani',
            'Hendra Gunawan',
        ];

        $codes = ['A7K2X', 'B8M3Y', 'C9N4Z', 'D2P5W', 'E3Q6V'];

        $names = [
            'Aditya Pratama',
            'Nabila Putri',
            'Rizky Ramadhan',
            'Salsabila Zahra',
            'Fajar Maulana',
            'Putri Aulia',
            'Dimas Saputra',
            'Ani Wulandari',
            'Dewi Lestari',
            'Agus Setiawan',
        ];

        foreach ($schools as $i => $schoolName) {
            $checkedCount = $i === 0 ? 4 : ($i === 1 ? 2 : 0);
            $rsvpStatus = $i === 3 ? 'Pending' : ($i === 4 ? 'Tidak Hadir' : 'Hadir');

            $invitation = Invitation::create([
                'id' => "school-{$i}",
                'code' => "GCP-SMP-{$codes[$i]}",
                'name' => $schoolName,
                'category' => 'SMP',
                'institution' => $schoolName,
                'principal' => $principals[$i] ?? 'Kepala Sekolah',
                'pic' => $pics[$i] ?? '',
                'phone' => "08123456780{$i}",
                'quota' => 10,
                'seat' => 'A-' . str_pad($i + 1, 2, '0', STR_PAD_LEFT),
                'rsvp' => $rsvpStatus,
                'checked' => $checkedCount,
                'mou' => $mouStatuses[$i % 4] ?? 'Belum dijadwalkan',
                'note' => '',
                'student' => '',
                'title' => '',
                'relationship' => 'Ayah',
                'vip_level' => 'VIP',
                'cancelled' => false,
                'mou_date' => '',
                'signer' => '',
            ]);

            $memberCount = $i === 0 ? 10 : ($i === 1 ? 8 : 6);
            for ($j = 0; $j < $memberCount; $j++) {
                Member::create([
                    'id' => "s{$i}-m{$j}",
                    'invitation_id' => $invitation->id,
                    'name' => $names[$j] ?? "Peserta {$j}",
                    'role' => $j < 6 ? 'Siswa' : 'Guru/Pendamping',
                    'present' => $j < $checkedCount,
                ]);
            }
        }

        $extraGuests = [
            ['Maam Honey', 'Guru', 'SMK Metland', 1, 'H7R2A', 'B-01', 'Hadir', 1, ''],
            ['Dra. Rina Handayani', 'Guru', 'SMP Negeri 4 Tambun', 2, 'J8S3B', 'B-02', 'Hadir', 0, ''],
            ['Bapak Hendra Wijaya', 'VIP', 'Dinas Pendidikan Kab. Bekasi', 2, 'K9T4C', 'VIP-03', 'Hadir', 0, ''],
            ['Ibu Sri Wahyuni', 'VIP', 'Yayasan Pendidikan Metland', 1, 'L2U5D', 'VIP-04', 'Hadir', 0, ''],
            ['Bapak Andi Prasetyo', 'Orang Tua/Wali', 'Mahes 2027 · XI PPLG 1', 2, 'M3V6E', 'B-05', 'Hadir', 0, 'Muhammad Farhan'],
            ['Ibu Dewi Anggraini', 'Orang Tua/Wali', 'Mahes 2027 · XI DKV', 2, 'N4W7F', 'B-06', 'Hadir', 0, 'Alya Safitri'],
            ['Bapak Agus Susanto', 'Orang Tua/Wali', 'Mahes 2027 · XI AKL', 2, 'P5X8G', 'B-07', 'Pending', 0, 'Kevin Pratama'],
        ];

        foreach ($extraGuests as $i => $guest) {
            [$name, $category, $institution, $quota, $codeToken, $seat, $rsvp, $checked, $student] = $guest;

            $prefix = match ($category) {
                'Guru' => 'GR',
                'VIP' => 'VIP',
                'Orang Tua/Wali' => 'ORT',
                default => 'GCP',
            };

            Invitation::create([
                'id' => "guest-{$i}",
                'code' => "GCP-{$prefix}-{$codeToken}",
                'name' => $name,
                'category' => $category,
                'institution' => $institution,
                'principal' => '',
                'pic' => '',
                'phone' => "08129876540{$i}",
                'quota' => $quota,
                'seat' => $seat,
                'rsvp' => $rsvp,
                'checked' => $checked,
                'mou' => 'Belum dijadwalkan',
                'note' => '',
                'student' => $student,
                'title' => '',
                'relationship' => 'Ayah',
                'vip_level' => 'VIP',
                'cancelled' => false,
                'mou_date' => '',
                'signer' => '',
            ]);
        }

        $activities = [
            ['text' => 'SMP Negeri 1 Cibitung · 4 peserta check-in', 'time' => 'Data simulasi'],
            ['text' => 'Maam Honey mengonfirmasi kehadiran', 'time' => 'Data simulasi'],
            ['text' => 'Undangan SMP Negeri 2 Cibitung dibuat', 'time' => 'Data simulasi'],
        ];

        foreach ($activities as $act) {
            Activity::create($act);
        }

        $messages = [
            [
                'name' => 'Nabila Putri',
                'text' => 'Semoga menjadi awal dari langkah besar dan prestasi yang membanggakan di Maheswara Maheswari 2027!',
                'category' => 'Siswa',
            ],
            [
                'name' => 'Ani Wulandari',
                'text' => 'Bangga melihat semangat generasi muda dalam merawat budaya dan meraih prestasi.',
                'category' => 'Guru / Pendamping',
            ],
            [
                'name' => 'Hendra Wijaya',
                'text' => 'Bersama kita tumbuhkan generasi yang berkarakter, kreatif, dan cinta Indonesia.',
                'category' => 'Tamu undangan',
            ],
        ];

        foreach ($messages as $msg) {
            Message::create($msg);
        }
    }
}
