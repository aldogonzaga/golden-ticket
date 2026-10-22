import { useState } from "react";
import {
  Plus,
  Download,
  Printer,
  Upload,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  QrCode,
  Trash2,
  Pencil,
  Share2,
  ArrowDownUp,
  Copy,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useSambut,
  categories,
  attendanceLabel,
  mouStatuses,
  type Invitation,
  type Category,
} from "@/lib/sambut/store";
import { exportData, inviteURL } from "@/lib/sambut/utils";
import { AdminLayout } from "./admin-layout";
import { Badge, RsvpBadge, Empty, Modal, copyText } from "./shared";
import { InvitationForm, BulkImporter } from "./invitation-form";
import { InvitationDetail } from "./invitation-detail";
import { toast } from "sonner";
export function InvitationsPage({ category }: { category?: Category }) {
  const { data, remove } = useSambut();
  const [tab, setTab] = useState<string>(category || "Semua");
  const [query, setQuery] = useState("");
  const [rsvp, setRsvp] = useState("");
  const [att, setAtt] = useState("");
  const [mou, setMou] = useState("");
  const [institution, setInstitution] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(false);
  const [form, setForm] = useState<Invitation | "new" | null>(null);
  const [detail, setDetail] = useState("");
  const [deleting, setDeleting] = useState<Invitation | null>(null);
  const [importing, setImporting] = useState(false);
  const rows = data.invitations
    .filter(
      (i) =>
        (tab === "Semua" || i.category === tab) &&
        (!rsvp || i.rsvp === rsvp) &&
        (!att || (att === "yes" ? i.checked > 0 : i.checked === 0)) &&
        (!mou || i.mou === mou) &&
        (!institution || i.institution === institution) &&
        `${i.name} ${i.code} ${i.phone} ${i.institution}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort((a, b) => (sort ? a.name.localeCompare(b.name) : 0));
  const current = rows.slice((page - 1) * 7, page * 7);
  const title =
    category === "SMP"
      ? "Data & Undangan SMP"
      : category === "Guru"
        ? "Undangan Guru"
        : category === "VIP"
          ? "Tamu VIP"
          : category === "Orang Tua/Wali"
            ? "Orang Tua / Wali Mahes 2027"
            : "Semua Undangan";
  const changeFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };
  return (
    <AdminLayout>
      <div className="admin-title-row">
        <div>
          <div className="admin-greeting">MANAJEMEN UNDANGAN</div>
          <h1>{title}</h1>
          <p>
            {category === "SMP"
              ? "Kelola sekolah, rombongan, dan kolaborasi MOU dalam satu tempat."
              : "Setiap undangan, satu langkah menuju perayaan yang istimewa."}
          </p>
        </div>
        <div className="admin-title-actions">
          <Button variant="outline" onClick={() => setImporting(true)}>
            <Upload />
            Impor
          </Button>
          <Button onClick={() => setForm("new")}>
            <Plus />
            Tambah Undangan
          </Button>
        </div>
      </div>
      {!category && (
        <div className="category-tabs">
          {["Semua", ...categories].map((c) => (
            <Button
              key={c}
              className={tab === c ? "active" : ""}
              onClick={() => changeFilter(() => setTab(c))}
            >
              {c === "Semua" ? "Semua Undangan" : c}
              <span>
                {data.invitations.filter((i) => c === "Semua" || i.category === c).length}
              </span>
            </Button>
          ))}
        </div>
      )}
      <section className="admin-panel">
        <header className="panel-header">
          <div>
            <h2>
              {rows.length} Undangan {category || "Terdaftar"}
            </h2>
            <p>Informasi RSVP dan kehadiran aktual tamu</p>
          </div>
          <div className="flex gap-2 no-print">
            <Button variant="ghost" size="sm" onClick={() => exportData(rows)}>
              <Download />
              Excel
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Cetak / PDF"
              aria-label="Cetak / PDF"
              onClick={() => window.print()}
            >
              <Printer />
            </Button>
          </div>
        </header>
        <div className="filter-bar">
          <label className="search-control">
            <Search />
            <input
              aria-label="Cari undangan"
              placeholder="Cari nama, sekolah, atau kode undangan…"
              value={query}
              onChange={(e) => changeFilter(() => setQuery(e.target.value))}
            />
          </label>
          <select
            aria-label="Filter RSVP"
            value={rsvp}
            onChange={(e) => changeFilter(() => setRsvp(e.target.value))}
          >
            <option value="">Semua RSVP</option>
            {["Pending", "Hadir", "Tidak Hadir"].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            aria-label="Filter kehadiran"
            value={att}
            onChange={(e) => changeFilter(() => setAtt(e.target.value))}
          >
            <option value="">Semua Kehadiran</option>
            <option value="yes">Sudah check-in</option>
            <option value="no">Belum check-in</option>
          </select>
          {tab === "SMP" ? (
            <select
              aria-label="Filter MOU"
              value={mou}
              onChange={(e) => changeFilter(() => setMou(e.target.value))}
            >
              <option value="">Semua MOU</option>
              {mouStatuses.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          ) : (
            <select
              aria-label="Filter instansi"
              value={institution}
              onChange={(e) => changeFilter(() => setInstitution(e.target.value))}
            >
              <option value="">Semua Instansi</option>
              {Array.from(new Set(data.invitations.map((i) => i.institution).filter(Boolean))).map(
                (i) => (
                  <option key={i}>{i}</option>
                ),
              )}
            </select>
          )}
        </div>
        <div className="table-wrap">
          <table className="invitation-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>
                  <Button variant="ghost" onClick={() => setSort(!sort)}>
                    Nama / Undangan <ArrowDownUp size={11} />
                  </Button>
                </th>
                <th>Kategori</th>
                <th>Kuota</th>
                <th>RSVP</th>
                <th>Check-in</th>
                <th>{tab === "SMP" ? "MOU" : "Tempat duduk"}</th>
                <th className="no-print">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {current.map((i, index) => (
                <tr key={i.id}>
                  <td className="text-muted-foreground text-xs">
                    {String((page - 1) * 7 + index + 1).padStart(2, "0")}
                  </td>
                  <td>
                    <span className="table-name">{i.name}</span>
                    <span className="table-sub">
                      {i.category === "SMP" ? i.principal : i.institution || i.student}
                    </span>
                    <span className="table-code block mt-2">{i.code}</span>
                  </td>
                  <td>
                    <Badge
                      tone={i.category === "VIP" ? "gold" : i.category === "SMP" ? "info" : "muted"}
                    >
                      {i.category}
                    </Badge>
                  </td>
                  <td>
                    <span className="table-name">
                      {i.quota} Orang
                    </span>
                    <span className="table-sub block text-[11px] text-muted-foreground">
                      Terisi {i.checked} dari {i.quota} orang
                    </span>
                  </td>
                  <td>
                    <RsvpBadge value={i.rsvp} />
                  </td>
                  <td>
                    <Badge tone={i.checked === 0 ? "muted" : i.checked >= i.quota ? "success" : "gold"}>
                      {i.checked === 0
                        ? "Belum hadir"
                        : i.checked >= i.quota
                          ? `✓ Hadir lengkap (${i.checked}/${i.quota})`
                          : `Hadir ${i.checked}/${i.quota}`}
                    </Badge>
                  </td>
                  <td>
                    {tab === "SMP" ? (
                      <Badge tone={i.mou === "Sudah ditandatangani" ? "success" : "gold"}>
                        {i.mou}
                      </Badge>
                    ) : (
                      <span className="table-sub">{i.seat || "—"}</span>
                    )}
                  </td>
                  <td className="no-print">
                    <div className="row-actions">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Lihat detail & QR"
                        aria-label={`Detail ${i.name}`}
                        onClick={() => setDetail(i.id)}
                      >
                        <Eye />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit undangan"
                        aria-label={`Edit ${i.name}`}
                        onClick={() => setForm(i)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Salin tautan undangan"
                        aria-label={`Salin tautan undangan ${i.name}`}
                        onClick={() => copyText(inviteURL(i.code))}
                      >
                        <Copy />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Bagikan tautan undangan via WhatsApp"
                        aria-label={`Bagikan tautan undangan ${i.name}`}
                        onClick={() =>
                          window.open(
                            `https://wa.me/${i.phone.replace(/^0/, "62").replace(/\D/g, "")}?text=${encodeURIComponent(`Sugeng Rawuh, ${i.category === "SMP" ? i.principal : i.name}. Anda diundang ke ${data.settings.name}. ${inviteURL(i.code)}`)}`,
                            "_blank",
                            "noopener,noreferrer",
                          )
                        }
                      >
                        <Share2 />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Hapus undangan"
                        aria-label={`Hapus ${i.name}`}
                        onClick={() => setDeleting(i)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!current.length && <Empty />}
        </div>
        <footer className="table-footer">
          <span>
            Menampilkan {rows.length ? (page - 1) * 7 + 1 : 0}–{Math.min(page * 7, rows.length)}{" "}
            dari {rows.length} undangan
          </span>
          <div className="pagination-actions">
            <Button
              variant="outline"
              size="icon"
              aria-label="Halaman sebelumnya"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft />
            </Button>
            <span>
              {page} / {Math.max(1, Math.ceil(rows.length / 7))}
            </span>
            <Button
              variant="outline"
              size="icon"
              aria-label="Halaman selanjutnya"
              disabled={page * 7 >= rows.length}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </footer>
      </section>
      {form && (
        <InvitationForm
          initial={form === "new" ? undefined : form}
          category={category}
          onClose={() => setForm(null)}
        />
      )}{" "}
      {importing && <BulkImporter onClose={() => setImporting(false)} />}{" "}
      {detail && (
        <InvitationDetail
          id={detail}
          onClose={() => setDetail("")}
          onEdit={(i) => {
            setDetail("");
            setForm(i);
          }}
        />
      )}
      {deleting && (
        <Modal title="Hapus undangan?" onClose={() => setDeleting(null)}>
          <p className="field-note">
            Undangan <strong>{deleting.name}</strong>, anggota, dan data kehadirannya akan dihapus
            dari perangkat ini.
          </p>
          <div className="form-actions">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Batalkan
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                remove(deleting.id);
                setDeleting(null);
                setPage(1);
                toast.success("Undangan dihapus");
              }}
            >
              <Trash2 />
              Hapus Undangan
            </Button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
