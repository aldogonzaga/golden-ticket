import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  categories,
  blankInvitation,
  newInvitation,
  useSambut,
  type Category,
  type Invitation,
} from "@/lib/sambut/store";
import { Modal } from "./shared";
import { toast } from "sonner";
import { Check, Upload } from "lucide-react";
export function InvitationForm({
  initial,
  category,
  onClose,
}: {
  initial?: Invitation | undefined;
  category?: Category | undefined;
  onClose: () => void;
}) {
  const { save, data } = useSambut();
  const [form, setForm] = useState<Invitation>(
    initial || {
      ...blankInvitation(),
      category: category || "SMP",
      quota: category && category !== "SMP" ? 1 : 10,
    },
  );
  const update = (key: keyof Invitation, value: string | number) =>
    setForm((s) => ({ ...s, [key]: value }));
  function submit(e: FormEvent) {
    e.preventDefault();
    if (
      form.category === "SMP" &&
      (!form.principal.trim() || form.quota > 10 || form.members.length > form.quota)
    ) {
      toast.error("Periksa nama kepala sekolah dan kuota rombongan.");
      return;
    }
    if (!Number.isInteger(form.quota) || form.quota < form.checked || form.quota < 1) {
      toast.error("Kuota tidak boleh lebih kecil dari jumlah check-in.");
      return;
    }
    if (
      data.invitations.some(
        (i) =>
          i.id !== form.id &&
          i.name.toLowerCase() === form.name.trim().toLowerCase() &&
          i.category === form.category,
      )
    ) {
      toast.error("Undangan dengan nama ini sudah tersedia.");
      return;
    }
    save(initial ? form : newInvitation({ ...form, name: form.name.trim() }));
    toast.success(initial ? "Undangan diperbarui" : "Undangan dan QR berhasil dibuat");
    onClose();
  }
  return (
    <Modal title={initial ? "Edit Undangan" : "Buat Undangan Baru"} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label className="field full">
            <span>Kategori undangan</span>
            <select
              value={form.category}
              disabled={!!initial}
              onChange={(e) =>
                setForm({
                  ...form,
                  category: e.target.value as Category,
                  quota: e.target.value === "SMP" ? 10 : 1,
                })
              }
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="field full">
            <span>{form.category === "SMP" ? "Nama sekolah *" : "Nama lengkap *"}</span>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              placeholder={form.category === "SMP" ? "SMP Negeri…" : "Nama penerima undangan"}
            />
          </label>
          {form.category === "SMP" ? (
            <>
              <label className="field full">
                <span>Nama lengkap kepala sekolah *</span>
                <input
                  required
                  value={form.principal}
                  onChange={(e) => update("principal", e.target.value)}
                  placeholder="Nama dan gelar kepala sekolah"
                />
              </label>
              <label className="field">
                <span>Nama PIC / guru koordinator</span>
                <input value={form.pic} onChange={(e) => update("pic", e.target.value)} />
              </label>
            </>
          ) : (
            <label className="field">
              <span>Instansi / sekolah</span>
              <input
                value={form.institution}
                onChange={(e) => update("institution", e.target.value)}
              />
            </label>
          )}
          <label className="field">
            <span>Nomor WhatsApp</span>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              type="tel"
              placeholder="08xxxxxxxxxx"
            />
          </label>
          {form.category === "Orang Tua/Wali" && (
            <>
              <label className="field">
                <span>Nama siswa Mahes 2027</span>
                <input
                  value={form.student}
                  onChange={(e) => update("student", e.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Hubungan dengan siswa</span>
                <select
                  value={form.relationship}
                  onChange={(e) => update("relationship", e.target.value)}
                >
                  {["Ayah", "Ibu", "Wali"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
            </>
          )}
          {(form.category === "Guru" || form.category === "VIP") && (
            <label className="field">
              <span>Jabatan / gelar</span>
              <input value={form.title} onChange={(e) => update("title", e.target.value)} />
            </label>
          )}
          {form.category === "VIP" && (
            <label className="field">
              <span>Tingkat VIP</span>
              <select value={form.vipLevel} onChange={(e) => update("vipLevel", e.target.value)}>
                {["VIP", "VVIP", "Tamu Kehormatan"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          )}
          <label className="field">
            <span>Kuota tamu {form.category === "SMP" ? "(maks. 10)" : ""} *</span>
            <input
              type="number"
              min={Math.max(1, form.checked, form.members.length)}
              max={form.category === "SMP" ? 10 : 100}
              required
              value={form.quota}
              onChange={(e) => update("quota", Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span>Area / nomor tempat duduk</span>
            <input
              value={form.seat}
              onChange={(e) => update("seat", e.target.value)}
              placeholder="A-01 / VIP-01"
            />
          </label>
          <label className="field">
            <span>Status RSVP</span>
            <select value={form.rsvp} onChange={(e) => update("rsvp", e.target.value)}>
              {["Pending", "Hadir", "Tidak Hadir"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="field full">
            <span>Catatan panitia</span>
            <textarea value={form.note} onChange={(e) => update("note", e.target.value)} />
          </label>
        </div>
        {form.category === "SMP" && (
          <p className="field-note mt-4">
            Satu sekolah menggunakan satu QR. Kuota mencakup seluruh siswa dan guru/pendamping.
          </p>
        )}
        <div className="form-actions">
          <Button variant="outline" type="button" onClick={onClose}>
            Batalkan
          </Button>
          <Button type="submit">
            <Check />
            Simpan Undangan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function BulkImporter({ onClose }: { onClose: () => void }) {
  const { save, data } = useSambut();
  const [category, setCategory] = useState<Category>("SMP");
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(false);
  const lines = text
    .split("\n")
    .filter((l) => l.trim())
    .map((l, index) => {
      const cols = l
        .split(l.includes("|") ? "|" : l.includes("\t") ? "\t" : ",")
        .map((v) => v.trim());
      const error =
        !cols[0] || (category === "SMP" && !cols[1])
          ? "Kolom wajib belum lengkap"
          : data.invitations.some(
                (i) =>
                  i.name.toLowerCase() === (cols[0] ?? "").toLowerCase() && i.category === category,
              )
            ? "Data sudah tersedia"
            : text
                  .split("\n")
                  .slice(0, index)
                  .some(
                    (p) =>
                      (p.split(/[|,\t]/)[0] ?? "").trim().toLowerCase() ===
                      (cols[0] ?? "").toLowerCase(),
                  )
              ? "Duplikat dalam impor"
              : "";
      return { cols, error, index };
    });
  function importRows() {
    const valid = lines.filter((l) => !l.error);
    valid.forEach(({ cols }) =>
      save(
        newInvitation({
          ...blankInvitation(),
          name: cols[0] ?? "",
          category,
          principal: category === "SMP" ? (cols[1] ?? "") : "",
          institution: category === "SMP" ? "" : cols[1] || "",
          pic: category === "SMP" ? cols[2] || "" : "",
          phone: category === "SMP" ? cols[3] || "" : cols[2] || "",
          seat: category === "SMP" ? cols[4] || "" : cols[3] || "",
          quota: category === "SMP" ? 10 : 1,
        }),
      ),
    );
    toast.success(
      `${valid.length} undangan diimpor; ${lines.length - valid.length} baris dilewati`,
    );
    onClose();
  }
  return (
    <Modal title="Impor Undangan" onClose={onClose}>
      <label className="field">
        <span>Kategori</span>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as Category);
            setPreview(false);
          }}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <p className="field-note my-4">
        {category === "SMP"
          ? "Nama Sekolah | Kepala Sekolah | PIC | WhatsApp | Seat"
          : "Nama Lengkap | Instansi | WhatsApp | Seat"}
        <br />
        Satu undangan per baris, tanpa baris judul. Pisahkan kolom dengan |, koma, atau tab.
      </p>
      <label className="field">
        <span>Tempel data undangan</span>
        <textarea
          rows={7}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setPreview(false);
          }}
          placeholder={
            category === "SMP"
              ? "SMP Negeri 5 | Budi Santoso | Ani | 08123456789 | A-06"
              : "Budi Santoso | SMK Metland | 08123456789 | B-01"
          }
        />
      </label>
      {preview && (
        <div className="bulk-preview">
          {lines.map((l) => (
            <p className={l.error ? "invalid" : ""} key={l.index}>
              Baris {l.index + 1}: {l.cols[0] || "Tanpa nama"} — {l.error || "Siap diimpor"}
            </p>
          ))}
          <p>
            {lines.filter((l) => !l.error).length} valid · {lines.filter((l) => l.error).length}{" "}
            tidak valid
          </p>
        </div>
      )}
      <div className="form-actions">
        <Button variant="outline" onClick={onClose}>
          Batalkan
        </Button>
        {preview ? (
          <Button disabled={!lines.some((l) => !l.error)} onClick={importRows}>
            <Upload />
            Impor Data Valid
          </Button>
        ) : (
          <Button disabled={!text.trim()} onClick={() => setPreview(true)}>
            Pratinjau Data
          </Button>
        )}
      </div>
    </Modal>
  );
}
