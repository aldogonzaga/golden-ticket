import { useEffect, useRef, useState } from "react";
import { Camera, ScanLine, Play, Square, Check, Plus, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSambut, attendanceLabel, type Invitation } from "@/lib/sambut/store";
import { toast } from "sonner";
import { AdminLayout } from "./admin-layout";
import { Badge, Empty, RsvpBadge } from "./shared";
export function CheckInPanel({ id }: { id: string }) {
  const { data, checkIn, save } = useSambut();
  const item = data.invitations.find((i) => i.id === id);
  const [selected, setSelected] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [name, setName] = useState("");
  const [role, setRole] = useState("Siswa");
  useEffect(() => {
    setSelected([]);
    setCount(1);
  }, [id]);
  if (!item) return <Empty title="Undangan tidak ditemukan" />;
  const remaining = item.quota - item.checked;
  return (
    <div className="scan-info">
      <Badge tone={item.cancelled ? "danger" : "success"}>
        {item.cancelled ? "Undangan dibatalkan" : "QR Valid"}
      </Badge>
      <h2>{item.name}</h2>
      <p>
        {item.category === "SMP" ? item.principal : item.institution}
        <br />
        Kode: {item.code} · {item.category}
      </p>
      <div className="scan-summary">
        <div>
          <small>Kuota</small>
          <strong>{item.quota}</strong>
        </div>
        <div>
          <small>Check-in</small>
          <strong>{item.checked}</strong>
        </div>
        <div>
          <small>Area duduk</small>
          <strong>{item.seat || "—"}</strong>
        </div>
      </div>
      <div className="flex gap-3">
        <RsvpBadge value={item.rsvp} />
        {item.category === "SMP" && <Badge tone="gold">MOU: {item.mou}</Badge>}
      </div>
      {item.cancelled ? (
        <div className="subtle-notice">Undangan telah dibatalkan. Check-in tidak diizinkan.</div>
      ) : remaining === 0 ? (
        <div className="subtle-notice">
          Kuota penuh — seluruh tamu telah check-in. Pemindaian ulang tidak menambah kehadiran.
        </div>
      ) : item.category === "SMP" ? (
        <>
          <p className="field-note mt-6">
            Pilih anggota yang benar-benar hadir ({selected.length} dipilih).
          </p>
          <div className="member-list">
            {item.members.map((m) => (
              <label className="member-row" key={m.id}>
                <input
                  type="checkbox"
                  disabled={m.present}
                  checked={m.present || selected.includes(m.id)}
                  onChange={(e) =>
                    setSelected((s) =>
                      e.target.checked ? [...s, m.id] : s.filter((id) => id !== m.id),
                    )
                  }
                />
                <div>
                  <strong>{m.name}</strong>
                  <small>{m.role}</small>
                </div>
                {m.present && <Badge tone="success">Sudah hadir</Badge>}
              </label>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mb-3"
            disabled={!item.members.some((m) => !m.present)}
            onClick={() => setSelected(item.members.filter((m) => !m.present).map((m) => m.id))}
          >
            Pilih Semua Anggota Belum Hadir
          </Button>
          <Button
            className="w-full"
            disabled={!selected.length}
            onClick={() => {
              if (checkIn(id, selected, 0)) setSelected([]);
            }}
          >
            <Check />
            Konfirmasi {selected.length} Peserta
          </Button>
          {item.members.length < item.quota && (
            <form
              className="member-add"
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                if (item.members.some((m) => m.name.toLowerCase() === name.trim().toLowerCase())) {
                  toast.error("Nama anggota sudah terdaftar");
                  return;
                }
                save({
                  ...item,
                  members: [
                    ...item.members,
                    { id: crypto.randomUUID(), name: name.trim(), role, present: false },
                  ],
                });
                setName("");
                toast.success("Anggota ditambahkan; pilih untuk check-in");
              }}
            >
              <label className="field">
                <span>Tambah anggota rombongan</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap"
                />
              </label>
              <label className="field">
                <span>Posisi</span>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  {["Siswa", "Guru/Pendamping", "Kepala Sekolah"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <Button type="submit" aria-label="Tambah anggota">
                <Plus />
              </Button>
            </form>
          )}
        </>
      ) : (
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            checkIn(id, [], count);
          }}
        >
          <label className="field">
            <span>Jumlah tamu yang hadir sekarang (sisa {remaining})</span>
            <input
              aria-label="Jumlah tamu hadir"
              type="number"
              min={1}
              max={remaining}
              step={1}
              required
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>
          <Button type="submit" className="w-full mt-4">
            <Check />
            Konfirmasi Check-in
          </Button>
        </form>
      )}
    </div>
  );
}
export function ScannerPage({ initialCode }: { initialCode?: string }) {
  const { data } = useSambut();
  const [code, setCode] = useState(initialCode || "");
  const [id, setId] = useState(
    () => data.invitations.find((i) => i.code === initialCode)?.id || "",
  );
  const [active, setActive] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [camera, setCamera] = useState("");
  const scanner = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    if (initialCode) setId(data.invitations.find((i) => i.code === initialCode)?.id || "");
  }, [initialCode, data.invitations]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const current = scanner.current;
      if (current?.isScanning) current.stop().catch(() => {});
    };
  }, []);
  function lookup(value: string) {
    let normalized = "";
    try {
      normalized = decodeURIComponent(value.split("/").pop() || value)
        .toUpperCase()
        .trim();
    } catch {
      setId("");
      setError("QR tidak valid. Format kode tidak dapat dibaca.");
      return;
    }
    const item = data.invitations.find((i) => i.code.toUpperCase() === normalized);
    if (!item) {
      setId("");
      setError("QR tidak valid. Kode undangan tidak ditemukan.");
      toast.error("QR tidak valid");
      return;
    }
    setId(item.id);
    setError("");
    setCode(item.code);
    setHistory((h) =>
      [`${item.name} · ${new Date().toLocaleTimeString("id-ID")}`, ...h].slice(0, 5),
    );
    if (scanner.current?.isScanning) stop();
  }
  async function stop() {
    try {
      if (scanner.current?.isScanning) await scanner.current.stop();
      setActive(false);
    } catch {
      setActive(false);
    }
  }
  async function start() {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const devices = await Html5Qrcode.getCameras();
      if (!devices.length) {
        toast.error("Kamera tidak ditemukan. Gunakan input manual.");
        return;
      }
      setCameras(devices);
      const selected = camera || devices.at(-1)?.id;
      if (!selected) return;
      setCamera(selected);
      if (!scanner.current) scanner.current = new Html5Qrcode("qr-reader");
      await scanner.current.start(
        selected,
        { fps: 10, qrbox: { width: 220, height: 220 } },
        lookup,
        () => {},
      );
      if (mounted.current) setActive(true);
    } catch {
      toast.error("Kamera tidak dapat diakses. Izinkan kamera atau gunakan kode manual.");
    }
  }
  return (
    <AdminLayout>
      <div className="admin-title-row">
        <div>
          <div className="admin-greeting">SAMBUT SETIAP KEHADIRAN</div>
          <h1>{initialCode ? "Konfirmasi Check-in" : "Scanner QR"}</h1>
          <p>Pindai tiket, periksa undangan, dan catat tamu yang benar-benar hadir.</p>
        </div>
        <Badge tone={active ? "success" : "gold"}>
          {active ? "Kamera Aktif" : "Mode Demo · Lokal"}
        </Badge>
      </div>
      <div className="scanner-grid">
        <section className="admin-panel">
          <div className="panel-header">
            <div>
              <h2>Pemindai Tiket</h2>
              <p>Satu pemindaian, satu undangan</p>
            </div>
            <ScanLine size={18} className="text-primary" />
          </div>
          <div className="camera-area">
            <div id="qr-reader" className="w-full" />
            {!active && (
              <div className="camera-empty absolute">
                <ScanLine />
                <p>Siap menyambut tamu berikutnya</p>
              </div>
            )}
          </div>
          {cameras.length > 1 && (
            <label className="field mx-5 mb-4">
              <span>Pilih kamera</span>
              <select disabled={active} value={camera} onChange={(e) => setCamera(e.target.value)}>
                {cameras.map((c) => (
                  <option value={c.id} key={c.id}>
                    {c.label || c.id}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="camera-actions">
            <Button disabled={active} onClick={start}>
              <Camera />
              Mulai Scanner
            </Button>
            <Button variant="outline" disabled={!active} onClick={stop}>
              <Square />
              Hentikan
            </Button>
          </div>
          <div className="manual-scan">
            <h3>Atau masukkan kode secara manual</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                lookup(code);
              }}
            >
              <input
                aria-label="Kode scan manual"
                className="control"
                value={code}
                required
                onChange={(e) => setCode(e.target.value)}
                placeholder="GCP-SMP-A7K2X"
              />
              <Button type="submit" aria-label="Periksa kode">
                <ArrowRight />
              </Button>
            </form>
            {error && <p className="text-destructive text-xs mt-3">{error}</p>}
            <p className="field-note mt-3">Contoh demo: GCP-SMP-A7K2X · GCP-VIP-K9T4C</p>
          </div>
          {history.length > 0 && (
            <div className="panel-content">
              <h3 className="text-xs mb-3">Pemindaian Terakhir</h3>
              {history.map((h, i) => (
                <p className="field-note mb-2" key={i}>
                  {h}
                </p>
              ))}
            </div>
          )}
        </section>
        <section className="admin-panel">
          <div className="panel-header">
            <h2>Detail & Klaim Tiket</h2>
            <Badge tone="muted">{id ? "Undangan ditemukan" : "Menunggu scan"}</Badge>
          </div>
          {id ? (
            <CheckInPanel id={id} />
          ) : (
            <Empty
              title="Tiket siapa yang kita sambut?"
              text="Pindai QR atau masukkan kode undangan untuk memulai."
            />
          )}
        </section>
      </div>
      <div className="subtle-notice">
        Mode simulasi: data tersimpan hanya pada perangkat ini. Penguncian absensi lintas perangkat
        memerlukan layanan server produksi.
      </div>
    </AdminLayout>
  );
}
