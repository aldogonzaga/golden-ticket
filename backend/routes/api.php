<?php

use App\Http\Controllers\ActivityController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CheckInController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\ResetController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StatsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Auth
Route::post('/login', [AuthController::class, 'login']);

// Public event portal & ticket
Route::get('/public/data', [PublicController::class, 'getPublicData']);
Route::get('/public/invitations/{code}', [PublicController::class, 'getInvitation']);
Route::post('/public/rsvp/{code}', [PublicController::class, 'submitRsvp']);
Route::post('/public/schools/{code}/members', [PublicController::class, 'updateSchoolMembers']);

// Messages (Ucapan & Doa)
Route::get('/messages', [MessageController::class, 'index']);
Route::post('/messages', [MessageController::class, 'store']);

// Public Settings & Stats
Route::get('/settings', [SettingController::class, 'show']);
Route::get('/stats', [StatsController::class, 'index']);

// Scanner verification & Check-in
Route::get('/check-in/verify/{identifier}', [CheckInController::class, 'verify']);
Route::post('/check-in', [CheckInController::class, 'checkIn']);

// Public invitation list / search (accessible for frontend components)
Route::get('/invitations', [InvitationController::class, 'index']);
Route::get('/invitations/{id}', [InvitationController::class, 'show']);

// Activities
Route::get('/activities', [ActivityController::class, 'index']);
Route::post('/activities', [ActivityController::class, 'store']);

/*
|--------------------------------------------------------------------------
| Admin & Protected / Management Routes
|--------------------------------------------------------------------------
*/
// Management CRUD
Route::post('/invitations', [InvitationController::class, 'store']);
Route::put('/invitations/{id}', [InvitationController::class, 'update']);
Route::delete('/invitations/{id}', [InvitationController::class, 'destroy']);
Route::post('/invitations/import', [InvitationController::class, 'import']);

Route::put('/settings', [SettingController::class, 'update']);
Route::get('/reports/export', [StatsController::class, 'export']);
Route::delete('/messages/{id}', [MessageController::class, 'destroy']);

// Reset simulation data
Route::post('/reset', [ResetController::class, 'reset']);

// Sanctum protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
