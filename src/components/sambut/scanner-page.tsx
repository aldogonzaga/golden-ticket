import { useEffect, useRef, useState } from "react";
import { Camera, ScanLine, Square, Check, ArrowRight, CheckCircle2, UserCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSambut, attendanceLabel, type Invitation } from "@/lib/sambut/store";
import { toast } from "sonner";
import { AdminLayout } from "./admin-layout";
import { Badge, Empty, RsvpBadge } from "./shared";

function playScanBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

export function CheckInPanel({
  id,
  onContinueScan,
}: {
  id: string;
  onContinueScan?: () => void;
}) {
  const { data } = useSambut();
  const item = data.invitations.find((i) => i.id === id);

  if (!item) {
    return (
      <div className="scan-info text-center py-6">
        <Empty title="Undangan tidak ditemukan" text="Kode tiket tidak terdaftar pada sistem database." />
        {onContinueScan && (
          <Button size="lg" className="mt-6 w-full py-6 text-base" onClick={onContinueScan}>
            <ScanLine className="mr-2 h-5 w-5" />
            Lanjut Scan Tiket Lain
          </Button>
        )}
      </div>
    );
  }

  const isFull = item.checked >= item.quota;
  const isCancelled = item.cancelled;

  return (
    <div className="scan-info">
      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-3">
        {isCancelled ? (
          <Badge tone="danger">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Undangan Dibatalkan
          </Badge>
        ) : isFull ? (
          <Badge tone="success">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Check-in Lengkap ({item.checked}/{item.quota})
          </Badge>
        ) : (
          <Badge tone="gold">
            <UserCheck className="w-3.5 h-3.5 mr-1" />
            Check-in Sebagian ({item.checked}/{item.quota})
          </Badge>
        )}
        <RsvpBadge value={item.rsvp} />
      </div>

      <h2 className="text-2xl font-bold leading-tight">{item.name}</h2>
      <p className="text-muted-foreground mt-1 text-sm">
        {item.category === "SMP" ? item.principal : item.institution || "Tamu Undangan"}
        <br />
        <span className="font-mono text-xs bg-muted/60 px-1.5 py-0.5 rounded text-foreground font-semibold">
          {item.code}
        </span>{" "}
        · <span className="text-primary font-medium">{item.category}</span>
      </p>

      {/* Ringkasan Kehadiran & Kursi */}
      <div className="scan-summary mt-5">
        <div>
          <small>Total Kuota</small>
          <strong>{item.quota} Tamu</strong>
        </div>
        <div>
          <small>Jumlah Hadir</small>
          <strong className={item.checked > 0 ? "text-emerald-500 font-bold" : ""}>
            {item.checked} Orang
          </strong>
        </div>
        <div>
          <small>Area / Kursi</small>
          <strong className="text-primary">{item.seat || "Bebas"}</strong>
        </div>
      </div>

      {/* Kartu Konfirmasi Berhasil */}
      {isCancelled ? (
        <div className="border border-destructive/40 bg-destructive/10 rounded-xl p-4 mt-6 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-2" />
          <h3 className="font-semibold text-destructive text-base">Undangan Tidak Berlaku</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Status undangan telah dibatalkan oleh panitia penyelenggara.
          </p>
        </div>
      ) : (
        <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-xl p-5 mt-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2.5">
            <Check className="w-6 h-6 stroke-[3]" />
          </div>
          <h3 className="font-bold text-emerald-400 text-lg">
            ✓ Berhasil di-Scan & Terkonfirmasi
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Kehadiran telah otomatis dicatat ke database MySQL. Selamat datang!
          </p>
          {item.seat && (
            <div className="inline-block mt-3 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              Silakan arahkan tamu menuju area duduk: <strong>{item.seat}</strong>
            </div>
          )}
        </div>
      )}

      {/* Tombol Konfirmasi: LANJUT SCAN */}
      {onContinueScan && (
        <Button
          type="button"
          size="lg"
          className="w-full mt-6 py-6 text-base font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          onClick={onContinueScan}
        >
          <ScanLine className="w-5 h-5" />
          Lanjut Scan
        </Button>
      )}
    </div>
  );
}

export function ScannerPage({ initialCode }: { initialCode?: string }) {
  const { data, checkIn } = useSambut();
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
    mounted.current = true;
    return () => {
      mounted.current = false;
      const current = scanner.current;
      if (current?.isScanning) current.stop().catch(() => {});
    };
  }, []);

  function performAutoCheckIn(item: Invitation) {
    if (item.cancelled) {
      toast.error(`Undangan ${item.name} dibatalkan`);
      return;
    }

    if (item.checked < item.quota) {
      if (item.category === "SMP") {
        const unpresent = (item.members || []).filter((m) => !m.present).map((m) => m.id);
        const count = unpresent.length > 0 ? unpresent.length : item.quota - item.checked;
        checkIn(item.id, unpresent, count);
      } else {
        const remaining = item.quota - item.checked;
        checkIn(item.id, [], remaining);
      }
      toast.success(`Check-in berhasil: ${item.name}`);
    } else {
      toast.info(`${item.name} sudah check-in lengkap sebelumnya`);
    }
  }

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
      toast.error("QR tidak valid. Kode undangan tidak ditemukan.");
      return;
    }

    // Suara konfirmasi beep
    playScanBeep();

    // Otomatis catat check-in saat scan berhasil
    performAutoCheckIn(item);

    setId(item.id);
    setError("");
    setCode(item.code);
    setHistory((h) =>
      [`${item.name} · ${new Date().toLocaleTimeString("id-ID")}`, ...h].slice(0, 5),
    );

    // Hentikan scanner sementara agar tidak scan berulang kali saat konfirmasi tampil
    if (scanner.current?.isScanning) stop();
  }

  useEffect(() => {
    if (initialCode && data.invitations.length > 0 && !id) {
      lookup(initialCode);
    }
  }, [initialCode, data.invitations]);

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

  function handleContinueScan() {
    setId("");
    setCode("");
    setError("");
    start();
  }

  return (
    <AdminLayout>
      <div className="admin-title-row">
        <div>
          <div className="admin-greeting">SAMBUT SETIAP KEHADIRAN</div>
          <h1>{initialCode ? "Konfirmasi Check-in" : "Scanner QR"}</h1>
          <p>Pindai tiket dan konfirmasi kehadiran tamu secara instan tanpa perlu isi formulir.</p>
        </div>
        <Badge tone={active ? "success" : "muted"}>
          {active ? "Kamera Aktif" : "Kamera Siap"}
        </Badge>
      </div>

      <div className="scanner-grid">
        <section className="admin-panel">
          <div className="panel-header">
            <div>
              <h2>Pemindai Tiket</h2>
              <p>Satu pemindaian, satu konfirmasi kehadiran</p>
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
            <p className="field-note mt-3">Ketik kode undangan lalu tekan Enter</p>
          </div>

          {history.length > 0 && (
            <div className="panel-content">
              <h3 className="text-xs mb-3 font-semibold uppercase tracking-wider text-muted-foreground">
                Pemindaian Terakhir
              </h3>
              {history.map((h, i) => (
                <p className="field-note mb-2 text-foreground/80 font-mono text-xs" key={i}>
                  ✓ {h}
                </p>
              ))}
            </div>
          )}
        </section>

        <section className="admin-panel">
          <div className="panel-header">
            <h2>Konfirmasi Kehadiran</h2>
            <Badge tone={id ? "success" : "muted"}>
              {id ? "Terkonfirmasi" : "Menunggu scan"}
            </Badge>
          </div>

          {id ? (
            <CheckInPanel id={id} onContinueScan={handleContinueScan} />
          ) : (
            <Empty
              title="Tiket siapa yang kita sambut?"
              text="Pindai QR barcode atau masukkan kode tiket untuk konfirmasi kehadiran otomatis."
            />
          )}
        </section>
      </div>
    </AdminLayout>
  );
}
