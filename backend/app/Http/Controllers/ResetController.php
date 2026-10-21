<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Invitation;
use App\Models\Member;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;

class ResetController extends Controller
{
    public function reset(): JsonResponse
    {
        Member::truncate();
        Invitation::truncate();
        Message::truncate();
        Activity::truncate();

        Artisan::call('db:seed', ['--force' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil dibersihkan ke kondisi awal.',
        ]);
    }
}
