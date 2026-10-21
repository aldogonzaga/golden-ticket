<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function show(): JsonResponse
    {
        $setting = Setting::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'Opening PPDB & SemiFinal Maheswara Maheswari 2027',
                'school' => 'SMK Metland',
                'date' => '',
                'location' => '',
                'tagline' => 'Empowering Our Chapter Through Indonesian Culture',
                'contact' => '',
                'group_photo' => '',
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $setting,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $setting = Setting::firstOrCreate(['id' => 1]);

        $validated = $request->validate([
            'name' => 'nullable|string',
            'school' => 'nullable|string',
            'date' => 'nullable|string',
            'location' => 'nullable|string',
            'tagline' => 'nullable|string',
            'contact' => 'nullable|string',
            'groupPhoto' => 'nullable|string',
            'group_photo' => 'nullable|string',
        ]);

        if (array_key_exists('name', $validated)) $setting->name = $validated['name'];
        if (array_key_exists('school', $validated)) $setting->school = $validated['school'];
        if (array_key_exists('date', $validated)) $setting->date = $validated['date'];
        if (array_key_exists('location', $validated)) $setting->location = $validated['location'];
        if (array_key_exists('tagline', $validated)) $setting->tagline = $validated['tagline'];
        if (array_key_exists('contact', $validated)) $setting->contact = $validated['contact'];
        if (array_key_exists('groupPhoto', $validated) || array_key_exists('group_photo', $validated)) {
            $setting->group_photo = $validated['groupPhoto'] ?? $validated['group_photo'] ?? '';
        }

        $setting->save();

        Activity::create([
            'text' => 'Pengaturan acara diperbarui',
            'time' => now()->format('H:i'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengaturan acara berhasil diperbarui.',
            'data' => $setting,
        ]);
    }
}
