<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('code')->unique()->index();
            $table->string('name');
            $table->string('category')->index(); // 'SMP', 'Guru', 'VIP', 'Orang Tua/Wali'
            $table->string('institution')->nullable();
            $table->string('principal')->nullable();
            $table->string('pic')->nullable();
            $table->string('phone')->nullable();
            $table->integer('quota')->default(1);
            $table->string('seat')->nullable();
            $table->string('rsvp')->default('Pending'); // 'Pending', 'Hadir', 'Tidak Hadir'
            $table->integer('checked')->default(0);
            $table->string('mou')->default('Belum dijadwalkan');
            $table->string('mou_date')->nullable();
            $table->string('signer')->nullable();
            $table->text('note')->nullable();
            $table->string('student')->nullable();
            $table->string('title')->nullable();
            $table->string('relationship')->nullable()->default('Ayah');
            $table->string('vip_level')->nullable()->default('VIP');
            $table->boolean('cancelled')->default(false);
            $table->timestamps();
        });

        Schema::create('members', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('invitation_id')->index();
            $table->string('name');
            $table->string('role')->default('Siswa');
            $table->boolean('present')->default(false);
            $table->timestamps();

            $table->foreign('invitation_id')->references('id')->on('invitations')->onDelete('cascade');
        });

        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Opening PPDB & SemiFinal Maheswara Maheswari 2027');
            $table->string('school')->default('SMK Metland');
            $table->string('date')->nullable();
            $table->string('location')->nullable();
            $table->text('tagline')->nullable()->default('Empowering Our Chapter Through Indonesian Culture');
            $table->string('contact')->nullable();
            $table->text('group_photo')->nullable();
            $table->timestamps();
        });

        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('text');
            $table->string('category')->default('Siswa');
            $table->timestamps();
        });

        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->string('text');
            $table->string('time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activities');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('members');
        Schema::dropIfExists('invitations');
    }
};
