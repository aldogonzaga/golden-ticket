import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, Download, ExternalLink, Trash2, UserPlus, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSambut, type Invitation, type Member } from "@/lib/sambut/store";
import { PublicLayout } from "./public-layout";
import { GoldenTicket } from "./public-pages";
import { Badge, Empty, SectionLabel, copyText } from "./shared";

export function schoolURL(code: string) {
  return `${window.location.origin}/sekolah/${encodeURIComponent(code)}`;
}

function MemberTicket({ item, member }: { item: Invitation; member: Member }) {
  const ref = useRef<HTMLDivElement>(null);
  async function download() {
    const ticket = ref.current?.querySelector<HTMLElement>(".ticket");
    if (!ticket) return;
    try {
      const { toPng } = await import("html-to-image");
      const url = await toPng(ticket, { pixelRatio: 2, style: { margin: "0" } });
      const a = document.createElement("a");
      a.download = `Golden-Ticket-${member.name.replace(/\s+/g, "-")}.png`;
      a.href = url;
      a.click();
    } catch {
      toast.error("Unduhan gagal. Coba lagi.");
    }
  }
  return (
    <div className="space-y-3">
      <div ref={ref}>
        <GoldenTicket item={item} member={member} />
      </div>
      <div className="ticket-actions">
        <Button onClick={download}>
          <Download />
          Unduh Tiket {member.name.split(" ")[0]}
        </Button>
      </div>
    </div>
  );
}

export function SchoolPortalPage({ code }: { code: string }) {
  const { data, ready, save } = useSambut();
  const item = data.invitations.find(
    (i) => i.code === code && i.category === "SMP" && !i.cancelled,
  );
  const [name, setName] = useState("");
  const [role, setRole] = useState("Siswa");
  const [show, setShow] = useState<string | null>(null);

  function add(e: FormEvent) {
    e.preventDefault();
    if (!item) return;
    const n = name.trim();
    if (!n) return void toast.error("Nama wajib diisi.");
    if (item.members.length >= item.quota)
      return void toast.error(`Kuota sekolah penuh (maks. ${item.quota} orang).`);
    if (item.members.some((m) => m.name.toLowerCase() === n.toLowerCase()))
      return void toast.error("Nama ini sudah terdaftar.");
    const member: Member = { id: crypto.randomUUID(), name: n, role, present: false };
    save({ ...item, members: [...item.members, member] });
    setName("");
    setShow(member.id);
    toast.success(`Golden Ticket untuk ${n} sudah dibuat`);
  }
  function remove(m: Member) {
    if (!item || m.present) return void toast.error("Peserta yang sudah check-in tidak bisa dihapus.");
    if (!confirm(`Hapus ${m.name}?`)) return;
    save({ ...item, members: item.members.filter((x) => x.id !== m.id) });
  }

  return (
    <PublicLayout>
      <main className="page-width inner-page">
        {!ready ? (
          <Empty title="Memuat data sekolah…" text="" />
        ) : !item ? (
          <Empty
            title="Tautan sekolah tidak ditemukan"
            text="Periksa kembali tautan atau hubungi panitia acara."
          />
        ) : (
          <>
            <SectionLabel>PENDAFTARAN PESERTA SEKOLAH</SectionLabel>
            <h1 className="page-heading text-center">{item.name}</h1>
            <p className="text-center text-muted-foreground mb-8">
              Kepala Sekolah: {item.principal} · Terisi {item.members.length} dari {item.quota}{" "}
              orang
            </p>
            <div className="grid gap-8 lg:grid-cols-2">
              <section className="space-y-4">
                <form onSubmit={add} className="rounded-lg border border-border bg-card p-5 space-y-3">
                  <h2 className="text-lg font-semibold">Tambah peserta</h2>
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Nama lengkap"
                    value={name}
                    maxLength={80}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option>Siswa</option>
                    <option>Guru/Pendamping</option>
                  </select>
                  <Button type="submit" disabled={item.members.length >= item.quota}>
                    <UserPlus />
                    {item.members.length >= item.quota ? "Kuota penuh" : "Daftarkan & buat tiket"}
                  </Button>
                </form>
                <div className="rounded-lg border border-border bg-card p-5">
                  <h2 className="text-lg font-semibold mb-3">Daftar peserta</h2>
                  {item.members.length === 0 ? (
                    <p className="text-muted-foreground">Belum ada peserta.</p>
                  ) : (
                    <ul className="space-y-2">
                      {item.members.map((m) => (
                        <li key={m.id} className="flex items-center justify-between gap-2">
                          <span>
                            <strong>{m.name}</strong>{" "}
                            <small className="text-muted-foreground">{m.role}</small>{" "}
                            {m.present && <Badge tone="gold">Hadir</Badge>}
                          </span>
                          <span className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => setShow(m.id)}>
                              Tiket
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Hapus ${m.name}`}
                              onClick={() => remove(m)}
                            >
                              <Trash2 />
                            </Button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
              <section>
                {(() => {
                  const m = item.members.find((x) => x.id === show) ?? item.members[0];
                  return m ? (
                    <MemberTicket item={item} member={m} />
                  ) : (
                    <Empty
                      title="Golden Ticket muncul di sini"
                      text="Isi nama peserta untuk membuat tiket atas namanya."
                    />
                  );
                })()}
              </section>
            </div>
          </>
        )}
      </main>
    </PublicLayout>
  );
}

export function SchoolLinksPage() {
  const { data } = useSambut();
  const schools = data.invitations.filter((i) => i.category === "SMP");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Link Pendaftaran Sekolah</h1>
        <p className="text-muted-foreground">
          Satu link untuk setiap sekolah. Sekolah mengisi pesertanya sendiri dan tiap peserta
          mendapat Golden Ticket atas namanya.
        </p>
      </div>
      {schools.length === 0 ? (
        <Empty title="Belum ada sekolah" text="Tambahkan undangan SMP terlebih dahulu." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-3">Sekolah</th>
                <th className="p-3">Terisi</th>
                <th className="p-3">Check-in</th>
                <th className="p-3">Link</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3">
                    <strong>{s.name}</strong>
                    <div className="text-muted-foreground">{s.code}</div>
                  </td>
                  <td className="p-3">
                    {s.checked}/{s.quota}
                  </td>
                  <td className="p-3">
                    <Badge tone={s.checked === 0 ? "muted" : s.checked >= s.quota ? "success" : "gold"}>
                      {s.checked === 0
                        ? "Belum hadir"
                        : s.checked >= s.quota
                          ? `✓ Penuh`
                          : `${s.checked} hadir`}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <Button size="sm" variant="outline" onClick={() => copyText(schoolURL(s.code))}>
                        <Copy />
                        Salin
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(
                            `https://wa.me/?text=${encodeURIComponent(`Silakan isi data peserta ${s.name} untuk Opening PPDB & SemiFinal Maheswara Maheswari 2027: ${schoolURL(s.code)}`)}`,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                      >
                        <Share2 />
                        WA
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link to="/sekolah/$code" params={{ code: s.code }} target="_blank">
                          <ExternalLink />
                          Buka
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
