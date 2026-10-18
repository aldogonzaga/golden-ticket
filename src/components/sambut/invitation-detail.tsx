import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Trash2, Plus, Pencil, ExternalLink, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSambut, mouStatuses, attendanceLabel, type Invitation } from "@/lib/sambut/store";
import { toast } from "sonner";
import { Modal, Badge, RsvpBadge, Empty } from "./shared";
import { GoldenTicket } from "./public-pages";
export function InvitationDetail({
  id,
  onClose,
  onEdit,
}: {
  id: string;
  onClose: () => void;
  onEdit: (i: Invitation) => void;
}) {
  const { data, save } = useSambut();
  const item = data.invitations.find((i) => i.id === id);
  const [tab, setTab] = useState("Informasi");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Siswa");
  const [editId, setEditId] = useState("");
  if (!item) return null;
  const tabs =
    item.category === "SMP"
      ? ["Informasi", "Anggota", "Golden Ticket", "MOU", "Kehadiran"]
      : ["Informasi", "Golden Ticket", "Kehadiran"];
  function addMember() {
    if (!item || !name.trim()) return;
    if (
      item.members.some(
        (m) => m.id !== editId && m.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      toast.error("Nama anggota sudah terdaftar");
      return;
    }
    if (editId) {
      save({
        ...item,
        members: item.members.map((m) => (m.id === editId ? { ...m, name: name.trim(), role } : m)),
      });
      setEditId("");
    } else {
      if (item.members.length >= item.quota) {
        toast.error("Kuota rombongan sudah penuh");
        return;
      }
      save({
        ...item,
        members: [
          ...item.members,
          { id: crypto.randomUUID(), name: name.trim(), role, present: false },
        ],
      });
    }
    setName("");
    toast.success("Data anggota tersimpan");
  }
  return (
    <Modal title={item.name} onClose={onClose} wide>
      <div className="detail-tabs">
        {tabs.map((t) => (
          <Button variant={tab === t ? "default" : "ghost"} key={t} onClick={() => setTab(t)}>
            {t}
            {t === "Anggota" ? ` (${item.members.length}/${item.quota})` : ""}
          </Button>
        ))}
      </div>
      {tab === "Informasi" && (
        <>
          <dl className="detail-info">
            {[
              ["Kode", item.code],
              ["Kategori", item.category],
              ["Kepala sekolah", item.principal || "—"],
              ["Instansi", item.institution || item.name],
              ["PIC / Kontak", `${item.pic || "—"} · ${item.phone || "—"}`],
              ["Tempat duduk", item.seat || "Belum ditetapkan"],
              ["Kuota", `${item.quota} orang`],
              ["Catatan", item.note || "Tidak ada catatan"],
              ["Siswa diwakili", item.student || "—"],
              ["Jabatan / hubungan", item.title || item.relationship || "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex gap-3 mt-6">
            <RsvpBadge value={item.rsvp} />
            <Badge tone={item.checked ? "success" : "muted"}>{attendanceLabel(item)}</Badge>
          </div>
          <div className="form-actions">
            <Button variant="outline" onClick={() => onEdit(item)}>
              <Pencil />
              Edit Undangan
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                save({ ...item, cancelled: !item.cancelled });
                toast.success(item.cancelled ? "Undangan diaktifkan" : "Undangan dibatalkan");
              }}
            >
              {item.cancelled ? "Aktifkan Undangan" : "Batalkan Undangan"}
            </Button>
          </div>
        </>
      )}
      {tab === "Golden Ticket" && (
        <>
          <GoldenTicket item={item} />
          <div className="text-center">
            <Button asChild variant="outline">
              <Link to="/ticket/$code" params={{ code: item.code }}>
                Buka & Unduh Tiket
                <ExternalLink />
              </Link>
            </Button>
          </div>
        </>
      )}
      {tab === "Anggota" && (
        <>
          <p className="field-note">
            {item.members.length} dari {item.quota} kuota terdaftar ·{" "}
            {item.members.filter((m) => m.role === "Siswa").length} siswa ·{" "}
            {item.members.filter((m) => m.role !== "Siswa").length} guru/pendamping
          </p>
          <div className="member-list">
            {item.members.map((m) => (
              <div className="member-row" key={m.id}>
                <div>
                  <strong>{m.name}</strong>
                  <small>{m.role}</small>
                </div>
                {m.present && <Badge tone="success">Check-in</Badge>}
                <Button
                  variant="ghost"
                  size="icon"
                  title="Edit anggota"
                  onClick={() => {
                    setEditId(m.id);
                    setName(m.name);
                    setRole(m.role);
                  }}
                >
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Hapus anggota"
                  onClick={() => {
                    if (window.confirm(`Hapus ${m.name} dari rombongan?`))
                      save({
                        ...item,
                        members: item.members.filter((p) => p.id !== m.id),
                        checked: item.checked - (m.present ? 1 : 0),
                      });
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
          <form
            className="member-add"
            onSubmit={(e) => {
              e.preventDefault();
              addMember();
            }}
          >
            <label className="field">
              <span>Nama lengkap anggota</span>
              <input value={name} required onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="field">
              <span>Posisi</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {["Siswa", "Guru/Pendamping", "Kepala Sekolah"].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <Button disabled={!editId && item.members.length >= item.quota} type="submit">
              {editId ? <Check /> : <Plus />}
              {editId ? "Simpan" : "Tambah"}
            </Button>
          </form>
          {editId && (
            <Button
              variant="ghost"
              className="mt-3"
              onClick={() => {
                setEditId("");
                setName("");
              }}
            >
              Batal edit
            </Button>
          )}
        </>
      )}
      {tab === "MOU" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            save({
              ...item,
              mou: String(f.get("mou")),
              mouDate: String(f.get("date")),
              signer: String(f.get("signer")),
              note: String(f.get("note")),
            });
            toast.success("Status MOU disimpan");
          }}
        >
          <div className="form-grid">
            <label className="field full">
              <span>Status penandatanganan</span>
              <select name="mou" defaultValue={item.mou}>
                {mouStatuses.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Tanggal penandatanganan</span>
              <input name="date" type="date" defaultValue={item.mouDate} />
            </label>
            <label className="field">
              <span>Nama penandatangan</span>
              <input name="signer" defaultValue={item.signer} />
            </label>
            <label className="field full">
              <span>Catatan tindak lanjut</span>
              <textarea name="note" defaultValue={item.note} />
            </label>
          </div>
          <div className="form-actions">
            <Button type="submit">
              <Check />
              Simpan MOU
            </Button>
          </div>
        </form>
      )}
      {tab === "Kehadiran" && (
        <>
          <div className="scan-summary">
            <div>
              <small>Kuota</small>
              <strong>{item.quota}</strong>
            </div>
            <div>
              <small>Sudah check-in</small>
              <strong>{item.checked}</strong>
            </div>
            <div>
              <small>Belum hadir</small>
              <strong>{item.quota - item.checked}</strong>
            </div>
          </div>
          {item.members
            .filter((m) => m.present)
            .map((m) => (
              <div className="member-row" key={m.id}>
                <div>
                  <strong>{m.name}</strong>
                  <small>{m.role}</small>
                </div>
                <Badge tone="success">Hadir</Badge>
              </div>
            ))}
          {item.checked === 0 && (
            <Empty
              title="Belum ada yang check-in"
              text="Kehadiran aktual akan muncul setelah dipindai panitia."
            />
          )}
          <div className="form-actions">
            <Button asChild>
              <Link to="/check-in/$code" params={{ code: item.code }}>
                Buka Check-in
                <ExternalLink />
              </Link>
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
