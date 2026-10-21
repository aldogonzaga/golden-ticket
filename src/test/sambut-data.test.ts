import { describe, expect, it } from 'vitest';
import { blankInvitation, stats, attendanceLabel } from '@/lib/sambut/store';
import { inviteURL } from '@/lib/sambut/utils';
describe('SAMBUT invitation rules',()=>{
 it('defaults schools to one invitation with total quota ten',()=>{const i=blankInvitation();expect(i.category).toBe('SMP');expect(i.quota).toBe(10);expect(i.members).toEqual([]);});
 it('keeps RSVP separate from actual attendance statistics',()=>{const i={...blankInvitation(),rsvp:'Hadir' as const,checked:0};expect(stats([i]).yes).toBe(1);expect(stats([i]).checked).toBe(0);expect(attendanceLabel(i)).toBe('Belum check-in');});
 it('counts registered school members rather than unused quota',()=>{const i={...blankInvitation(),members:[{id:'m1',name:'Nabila',role:'Siswa',present:true}],checked:1};const s=stats([i]);expect(s.registered).toBe(1);expect(s.quota).toBe(10);expect(s.checked).toBe(1);expect(attendanceLabel(i)).toBe('Hadir sebagian');});
 it('routes invitation links to the home page with the invitation code',()=>{const url=new URL(inviteURL('GCP-SMP-ABC123'));expect(url.pathname).toBe('/');expect(url.searchParams.get('undangan')).toBe('GCP-SMP-ABC123');});
});
