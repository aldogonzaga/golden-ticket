<?php

namespace Tests\Feature;

use App\Models\Invitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SambutApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
        $this->artisan('db:seed', ['--class' => 'DemoSeeder']);
    }

    public function test_admin_can_login_with_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'GenZ2026',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login berhasil.',
            ])
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'username', 'email'],
            ]);
    }

    public function test_admin_login_fails_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'wrong-pass',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_can_list_invitations_and_filter_by_category(): void
    {
        $response = $this->getJson('/api/invitations');
        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonCount(12, 'data');

        $smpResponse = $this->getJson('/api/invitations?category=SMP');
        $smpResponse->assertStatus(200)
            ->assertJsonCount(5, 'data');
    }

    public function test_can_fetch_single_invitation_by_code(): void
    {
        $response = $this->getJson('/api/public/invitations/GCP-SMP-A7K2X');
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'code' => 'GCP-SMP-A7K2X',
                    'name' => 'SMP Negeri 1 Cibitung',
                ],
            ]);
    }

    public function test_can_submit_rsvp_publicly(): void
    {
        $response = $this->postJson('/api/public/rsvp/GCP-SMP-D2P5W', [
            'rsvp' => 'Hadir',
            'phone' => '081299998888',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'rsvp' => 'Hadir',
                ],
            ]);
    }

    public function test_check_in_guest_successfully(): void
    {
        $invitation = Invitation::where('code', 'GCP-GR-J8S3B')->first();
        $this->assertEquals(0, $invitation->checked);

        $response = $this->postJson('/api/check-in', [
            'code' => 'GCP-GR-J8S3B',
            'count' => 1,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'added' => 1,
            ]);

        $this->assertEquals(1, $invitation->fresh()->checked);
    }

    public function test_stats_endpoint_returns_accurate_numbers(): void
    {
        $response = $this->getJson('/api/stats');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total',
                    'schools',
                    'quota',
                    'registered',
                    'yes',
                    'no',
                    'pending',
                    'checked',
                    'by_category',
                    'mou_stats',
                ],
            ]);
    }

    public function test_can_get_and_update_settings(): void
    {
        $getResponse = $this->getJson('/api/settings');
        $getResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'school' => 'SMK Metland',
                ],
            ]);

        $updateResponse = $this->putJson('/api/settings', [
            'location' => 'Auditorium SMK Metland',
        ]);

        $updateResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'location' => 'Auditorium SMK Metland',
                ],
            ]);
    }

    public function test_can_post_and_get_messages(): void
    {
        $postResponse = $this->postJson('/api/messages', [
            'name' => 'Budi Siregar',
            'text' => 'Sukses terus untuk SMK Metland!',
            'category' => 'Tamu',
        ]);

        $postResponse->assertStatus(201);

        $getResponse = $this->getJson('/api/messages');
        $getResponse->assertStatus(200)
            ->assertJsonFragment([
                'name' => 'Budi Siregar',
                'text' => 'Sukses terus untuk SMK Metland!',
            ]);
    }
}
