<?php

namespace App\Http\Controllers;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;

class ResetController extends Controller
{
    public function reset(): JsonResponse
    {
        Artisan::call('db:seed', ['--force' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Data simulasi berhasil direset ke kondisi awal.',
        ]);
    }
}
