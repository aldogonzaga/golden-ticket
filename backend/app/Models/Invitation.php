<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Invitation extends Model
{
    use HasFactory;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'code',
        'name',
        'category',
        'institution',
        'principal',
        'pic',
        'phone',
        'quota',
        'seat',
        'rsvp',
        'checked',
        'mou',
        'mou_date',
        'signer',
        'note',
        'student',
        'title',
        'relationship',
        'vip_level',
        'cancelled',
    ];

    protected $casts = [
        'quota' => 'integer',
        'checked' => 'integer',
        'cancelled' => 'boolean',
    ];

    protected $appends = [
        'vipLevel',
        'mouDate',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
            if (empty($model->code)) {
                $prefix = match ($model->category) {
                    'Guru' => 'GR',
                    'VIP' => 'VIP',
                    'Orang Tua/Wali' => 'ORT',
                    default => 'SMP',
                };
                $token = strtoupper(substr(str_replace('-', '', (string) Str::uuid()), 0, 5));
                $model->code = "GCP-{$prefix}-{$token}";
            }
        });
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'invitation_id', 'id');
    }

    public function getVipLevelAttribute(): ?string
    {
        return $this->attributes['vip_level'] ?? null;
    }

    public function setVipLevelAttribute(?string $value): void
    {
        $this->attributes['vip_level'] = $value;
    }

    public function getMouDateAttribute(): ?string
    {
        return $this->attributes['mou_date'] ?? null;
    }

    public function setMouDateAttribute(?string $value): void
    {
        $this->attributes['mou_date'] = $value;
    }
}
