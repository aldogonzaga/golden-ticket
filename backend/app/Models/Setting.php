<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'school',
        'date',
        'location',
        'tagline',
        'contact',
        'group_photo',
    ];

    protected $appends = [
        'groupPhoto',
    ];

    public function getGroupPhotoAttribute(): ?string
    {
        return $this->attributes['group_photo'] ?? null;
    }

    public function setGroupPhotoAttribute(?string $value): void
    {
        $this->attributes['group_photo'] = $value;
    }
}
