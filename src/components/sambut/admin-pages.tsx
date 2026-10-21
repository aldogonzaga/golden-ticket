import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, Navigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Download,
  Printer,
  Check,
  ImagePlus,
  RotateCcw,
  FileSpreadsheet,
  ClipboardCheck,
  Search,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSambut, stats, categories, type Settings } from "@/lib/sambut/store";
import { exportData, eventDate } from "@/lib/sambut/utils";
import templeImage from "@/assets/borobudur-dawn.jpg";
import { AdminLayout } from "./admin-layout";
import { StatCards } from "./dashboard-page";
import { Brand, SectionLabel, Badge, RsvpBadge, Empty, Modal } from "./shared";
import { InvitationDetail } from "./invitation-detail";
export function LoginPage() {
  const { loggedIn, login } = useSambut();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (loggedIn) return <Navigate to="/admin/dashboard" />;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("username") !== "admin" || f.get("password") !== "GenZ2026") {
      setError("Username atau password demo tidak sesuai.");
      return;
    }
    setLoading(true);
    login();
    await navigate({ to: "/admin/dashboard" });
  }
  return (
    <div className="login-page">
      <section className="login-visual">
        <img src={templeImage} width={1920} height={1088} alt="Inspirasi Budaya Nusantara" />
        <div>
          <SectionLabel>RUANG PANITIA MAHESWARA MAHESWARI 2026</SectionLabel>
          <h1>
            Sambut setiap tamu.
            <br />
            Rayakan setiap cerita.
          </h1>
        </div>
      </section>
      <div className="login-form-side">
        <form className="login-form" onSubmit={submit}>
          <div className="login-form-heading">
            <Brand compact />
           
          </div>
          <div className="login-fields">
            <label className="field">
              <span>Username</span>
              <input
                name="username"
                required
                autoComplete="username"
                placeholder="Username panitia"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="Password panitia"
              />
            </label>
          </div>
          {error && <p className="text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Masuk…" : "Masuk ke Ruang Panitia"}
            <ArrowRight />
          </Button>
          <Link className="back-link" to="/">
            ← Kembali ke website acara
          </Link>
        </form>
      </div>
    </div>
  );
}
export function AttendancePage() {
  const { data } = useSambut();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [detail, setDetail] = useState("");
  const rows = data.invitations.filter(
    (i) =>
      (!category || i.category === category) &&
      (!status || (status === "yes" ? i.checked > 0 : i.checked === 0)) &&
      i.name.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <AdminLayout>
      <div className="admin-title-row">
        <div>
          <div className="admin-greeting">REKAP HARI PERAYAAN</div>
          <h1>Kehadiran yang bermakna.</h1>
          <p>RSVP adalah rencana. Check-in mencatat siapa yang benar-benar hadir.</p>
        </div>
        <div className="admin-title-actions">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer />
            Cetak / PDF
          </Button>
          <Button onClick={() => exportData(rows)}>
            <Download />
            Ekspor Excel
          </Button>
        </div>
      </div>
      <StatCards />
      <section className="admin-panel">
        <div className="panel-header">
          <h2>Rekap Kehadiran Tamu</h2>
          <Badge tone="gold">{rows.reduce((s, i) => s + i.checked, 0)} orang hadir</Badge>
        </div>
        <div className="filter-bar">
          <label className="search-control">
            <Search />
            <input
              aria-label="Cari rekap"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari sekolah atau tamu…"
            />
          </label>
          <select
            aria-label="Kategori rekap"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Status rekap"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Semua Kehadiran</option>
            <option value="yes">Sudah check-in</option>
            <option value="no">Belum check-in</option>
          </select>
        </div>
        <div className="table-wrap">
          <table className="invitation-table">
            <thead>
              <tr>
                <th>Sekolah / Tamu</th>
                <th>Kategori</th>
                <th>RSVP</th>
                <th>Terdaftar</th>
                <th>Hadir / Kuota</th>
                <th>Anggota Hadir</th>
                <th className="no-print">Detail</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <td>
                    <span className="table-name">{i.name}</span>
                    <small className="table-code">{i.code}</small>
                  </td>
                  <td>
                    <Badge>{i.category}</Badge>
                  </td>
                  <td>
                    <RsvpBadge value={i.rsvp} />
                  </td>
                  <td>{i.category === "SMP" ? i.members.length : i.quota}</td>
                  <td>
                    <Badge tone={i.checked ? "success" : "muted"}>
                      {i.checked} / {i.quota}
                    </Badge>
                  </td>
                  <td>
                    <span className="table-sub">
                      {i.members
                        .filter((m) => m.present)
                        .map((m) => m.name)
                        .join(", ") || (i.checked ? `${i.checked} tamu hadir` : "—")}
                    </span>
                  </td>
                  <td className="no-print">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Kehadiran ${i.name}`}
                      onClick={() => setDetail(i.id)}
                    >
                      <Eye />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && <Empty />}
        </div>
      </section>
      {detail && (
        <InvitationDetail
          id={detail}
          onClose={() => setDetail("")}
          onEdit={() => {
            setDetail("");
            toast.info("Edit undangan melalui halaman Semua Undangan.");
          }}
        />
      )}
    </AdminLayout>
  );
}
export function ReportsPage() {
  const { data } = useSambut();
  const [category, setCategory] = useState("");
  const [school, setSchool] = useState("");
  const rows = data.invitations.filter(
    (i) => (!category || i.category === category) && (!school || i.id === school),
  );
  const s = stats(rows);
  return (
    <AdminLayout>
      <div className="admin-title-row">
        <div>
          <div className="admin-greeting">DATA MENJADI CERITA</div>
          <h1>Laporan & Rekapitulasi</h1>
          <p>Ringkasan undangan, kehadiran, dan kolaborasi dalam laporan siap unduh.</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer />
          Cetak Laporan
        </Button>
      </div>
      <section className="admin-panel mb-6">
        <div className="filter-bar">
          <select
            aria-label="Kategori laporan"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Sekolah laporan"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
          >
            <option value="">Semua Sekolah</option>
            {data.invitations
              .filter((i) => i.category === "SMP")
              .map((i) => (
                <option value={i.id} key={i.id}>
                  {i.name}
                </option>
              ))}
          </select>
        </div>
        <div className="panel-content">
          <div className="stat-grid mb-0">
            {[
              ["Undangan", s.total],
              ["Kuota", s.quota],
              ["RSVP Hadir", s.yes],
              ["Check-in", s.checked],
            ].map(([label, val]) => (
              <article className="stat-card" key={label}>
                <div className="stat-top">{label}</div>
                <div className="stat-value">{val}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="admin-panel">
        <div className="panel-header">
          <h2>Laporan Siap Unduh</h2>
          <FileSpreadsheet size={18} className="text-primary" />
        </div>
        {[
          ["Seluruh Data Undangan", "Kode, kategori, kuota, RSVP, tempat duduk, dan check-in."],
          ["Rekap Kehadiran", "Hanya undangan dengan tamu yang telah check-in."],
          ["Laporan MOU Sekolah", "Nama kepala sekolah dan status kolaborasi setiap SMP."],
        ].map(([title, text], idx) => (
          <div className="report-row" key={title}>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
            <div className="no-print">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportData(
                    rows.filter((i) =>
                      idx === 1 ? i.checked > 0 : idx === 2 ? i.category === "SMP" : true,
                    ),
                    "csv",
                  )
                }
              >
                <Download />
                CSV
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  exportData(
                    rows.filter((i) =>
                      idx === 1 ? i.checked > 0 : idx === 2 ? i.category === "SMP" : true,
                    ),
                  )
                }
              >
                <Download />
                Excel
              </Button>
            </div>
          </div>
        ))}
      </section>
      <section className="admin-panel mt-6">
        <div className="panel-header">
          <h2>Ringkasan per Kategori</h2>
        </div>
        <div className="table-wrap">
          <table className="invitation-table">
            <thead>
              <tr>
                <th>Kategori</th>
                <th>Undangan</th>
                <th>Kuota</th>
                <th>Hadir RSVP</th>
                <th>Check-in</th>
                <th>Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const t = stats(rows.filter((i) => i.category === c));
                return (
                  <tr key={c}>
                    <td>{c}</td>
                    <td>{t.total}</td>
                    <td>{t.quota}</td>
                    <td>{t.yes}</td>
                    <td>{t.checked}</td>
                    <td>{t.quota ? Math.round((t.checked / t.quota) * 100) : 0}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
async function compressGroupPhoto(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    const scale = Math.min(1, 1600 / image.naturalWidth, 1200 / image.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas tidak tersedia");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
export function SettingsPage() {
  const { data, updateSettings, reset } = useSambut();
  const [draft, setDraft] = useState<Settings>(data.settings);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setDraft(data.settings), [data.settings]);
  function submit(e: FormEvent) {
    e.preventDefault();
    updateSettings(draft);
    toast.success("Informasi acara diperbarui");
  }
  return (
    <AdminLayout>
      <div className="admin-title-row">
        <div>
          <div className="admin-greeting">DETAIL YANG BERARTI</div>
          <h1>Pengaturan Acara</h1>
          <p>Siapkan informasi resmi yang akan muncul pada undangan dan Golden Ticket.</p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="admin-panel">
          <div className="panel-header">
            <h2>Identitas & Informasi Acara</h2>
          </div>
          <form className="panel-content" onSubmit={submit}>
            <div className="form-grid">
              {(
                [
                  ["name", "Nama acara"],
                  ["school", "Sekolah penyelenggara"],
                  ["date", "Tanggal & waktu acara"],
                  ["location", "Lokasi acara"],
                  ["tagline", "Tagline"],
                  ["contact", "Kontak panitia"],
                ] as const
              ).map(([key, label]) => (
                <label className={`field ${key === "tagline" ? "full" : ""}`} key={key}>
                  <span>{label}</span>
                  <input
                    type={key === "date" ? "datetime-local" : "text"}
                    value={draft[key]}
                    required={key === "name"}
                    placeholder={
                      key === "location"
                        ? "Nama gedung / alamat"
                        : key === "contact"
                          ? "Nomor WhatsApp panitia"
                          : ""
                    }
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  />
                </label>
              ))}
              <label className="field full">
                <span>Foto kebersamaan Maheswara Maheswari</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.currentTarget.files?.[0];
                    if (!file) return;
                    try {
                      const groupPhoto = await compressGroupPhoto(file);
                      setDraft((current) => ({ ...current, groupPhoto }));
                      toast.success("Foto siap disimpan bersama pengaturan acara");
                    } catch {
                      toast.error("Foto tidak dapat dibaca. Pilih file gambar lain.");
                    }
                  }}
                />
                <small className="field-note">
                  Foto akan dioptimalkan dan tersimpan pada perangkat ini.
                </small>
              </label>
              {draft.groupPhoto && (
                <div className="field full group-photo-control">
                  <span>Pratinjau foto</span>
                  <div className="group-photo-preview">
                    <img
                      src={draft.groupPhoto}
                      alt="Pratinjau foto kebersamaan Maheswara Maheswari"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDraft((current) => ({ ...current, groupPhoto: "" }))}
                    >
                      Hapus Foto
                    </Button>
                  </div>
                </div>
              )}
              <label className="field">
                <span>Batas kuota SMP</span>
                <input value="10 orang (siswa + guru)" disabled />
              </label>
              <div className="field">
                <span>Penyimpanan</span>
                <p className="field-note">
                  Demo lokal pada perangkat. Tidak tersinkron antarperangkat.
                </p>
              </div>
            </div>
            <div className="form-actions">
              <Button type="submit">
                <Check />
                Simpan Pengaturan
              </Button>
            </div>
          </form>
        </section>
        <div>
          <div className="settings-preview">
            <img
              src={templeImage}
              width={1920}
              height={1088}
              loading="lazy"
              alt="Pratinjau undangan budaya"
            />
            <div>
              <SectionLabel>PRATINJAU UNDANGAN</SectionLabel>
              <h3>{draft.name}</h3>
              <p>{draft.tagline}</p>
              <p className="mt-5">
                {eventDate(draft.date)}
                <br />
                {draft.location || "Lokasi Acara"}
              </p>
              <Button asChild className="mt-5" variant="outline">
                <Link to="/">
                  Lihat Website Acara
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <div className="subtle-notice">
            Tanggal, lokasi, dan kontak masih menunggu informasi resmi. Nama penyelenggara
            menggunakan contoh dari referensi.
          </div>
        </div>
      </div>
      <div className="danger-zone">
        <div>
          <h3>Reset Data Demo</h3>
          <p>Kembalikan undangan, kehadiran, pesan, dan pengaturan ke contoh awal.</p>
        </div>
        <Button variant="destructive" onClick={() => setConfirm(true)}>
          <RotateCcw />
          Reset Demo
        </Button>
      </div>
      {confirm && (
        <Modal title="Reset seluruh data demo?" onClose={() => setConfirm(false)}>
          <p className="field-note">
            Semua perubahan pada perangkat ini akan dihapus. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="form-actions">
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Batalkan
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                reset();
                setDraft({
                  name: "Opening PPDB & SemiFinal Maheswara Maheswari 2027",
                  school: "SMK Metland",
                  date: "",
                  location: "",
                  tagline: "Empowering Our Chapter Through Indonesian Culture",
                  contact: "",
                  groupPhoto: "",
                });
                setConfirm(false);
                toast.success("Data demo dikembalikan");
              }}
            >
              Ya, Reset Data
            </Button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
