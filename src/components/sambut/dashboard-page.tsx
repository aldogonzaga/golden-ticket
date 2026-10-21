import { Link } from "@tanstack/react-router";
import {
  Tickets,
  School,
  Users,
  CheckCheck,
  ArrowUpRight,
  Plus,
  Download,
  Activity,
  ChevronRight,
  Check,
  Clock3,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";
import { useSambut, stats, categories } from "@/lib/sambut/store";
import { exportData } from "@/lib/sambut/utils";
import { AdminLayout } from "./admin-layout";
import { Badge, RsvpBadge } from "./shared";
export function StatCards() {
  const { data } = useSambut();
  const s = stats(data.invitations);
  return (
    <div className="stat-grid">
      {[
        ["Total Undangan", s.total, `${s.schools} sekolah · 4 kategori`, Tickets],
        ["Kuota Tamu", s.quota, `${s.registered} tamu telah terdaftar`, Users],
        ["Konfirmasi Hadir", s.yes, `${s.pending} menunggu · ${s.no} tidak hadir`, CheckCheck],
        [
          "Sudah Check-in",
          s.checked,
          `${Math.round((s.checked / s.quota) * 100) || 0}% dari total kuota tamu`,
          School,
        ],
      ].map(([label, value, note, Icon], index) => {
        const C = Icon as typeof Tickets;
        return (
          <article className={`stat-card ${index === 3 ? "highlight" : ""}`} key={String(label)}>
            <div className="stat-top">
              {String(label)}
              <C />
            </div>
            <div className="stat-value">{String(value).padStart(2, "0")}</div>
            <div className="stat-footer">
              {index === 3 ? <ArrowUpRight /> : <span className="text-primary">•</span>}
              {String(note)}
            </div>
          </article>
        );
      })}
    </div>
  );
}
export function DashboardPage() {
  const { data } = useSambut();
  const s = stats(data.invitations);
  const chart = categories.map((c) => ({
    name: c === "Orang Tua/Wali" ? "Orang Tua" : c,
    Terdaftar: data.invitations
      .filter((i) => i.category === c)
      .reduce((sum, i) => sum + (c === "SMP" ? i.members.length : i.quota), 0),
    Hadir: data.invitations.filter((i) => i.category === c).reduce((sum, i) => sum + i.checked, 0),
  }));
  return (
    <AdminLayout>
      <div className="admin-title-row">
        <div>
          <div className="admin-greeting">Selamat Datang, PANITIA MHSWR 2026</div>
          <h1>Setiap tamu, sebuah cerita.</h1>
          <p>Pantau undangan dan sambut setiap kehadiran dengan lebih bermakna.</p>
        </div>
        <div className="admin-title-actions">
          <Button variant="outline" onClick={() => exportData(data.invitations)}>
            <Download />
            Ekspor Laporan
          </Button>
          <Button asChild>
            <Link to="/admin/invitations">
              <Plus />
              Kelola Undangan
            </Link>
          </Button>
        </div>
      </div>
      <StatCards />
      <div className="chart-grid">
        <section className="admin-panel">
          <div className="panel-header">
            <div>
              <h2>Gambaran Kehadiran</h2>
              <p>Tamu terdaftar dan check-in aktual per kategori</p>
            </div>
            <Badge tone="gold">Data Demo</Badge>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart} barGap={5}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "var(--muted-foreground)", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 5,
                    color: "var(--foreground)",
                    fontSize: 10,
                  }}
                  cursor={{ fill: "var(--secondary)" }}
                />
                <Bar
                  dataKey="Terdaftar"
                  fill="var(--secondary)"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
                <Bar dataKey="Hadir" fill="var(--primary)" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5 pb-5 text-[9px] text-muted-foreground">
            <span>□ Terdaftar</span>
            <span className="text-primary">■ Hadir</span>
          </div>
        </section>
        <section className="admin-panel">
          <div className="panel-header">
            <div>
              <h2>Komposisi Undangan</h2>
              <p>{s.total} undangan dalam empat kategori</p>
            </div>
            <Users size={17} className="text-primary" />
          </div>
          <div className="distribution">
            {categories.map((c, index) => {
              const count = data.invitations.filter((i) => i.category === c).length;
              return (
                <div className="distribution-row" key={c}>
                  <div className="distribution-label">
                    <strong className="font-normal">
                      {c === "Orang Tua/Wali"
                        ? "Orang Tua / Wali"
                        : c === "SMP"
                          ? "Sekolah SMP"
                          : c === "VIP"
                            ? "Tamu VIP"
                            : "Undangan Guru"}
                    </strong>
                    <span>{count} undangan</span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill tone-${index}`}
                      style={
                        {
                          "--progress": `${(count / s.total) * 100}%`,
                        } as import("react").CSSProperties
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
      <div className="dashboard-bottom">
        <section className="admin-panel">
          <div className="panel-header">
            <div>
              <h2>Undangan Terbaru</h2>
              <p>Ringkasan undangan dan irmasi kehadiran</p>
            </div>
            <Button asChild size="sm" variant="ghost">
              <Link to="/admin/invitations">
                Lihat Semua
                <ChevronRight />
              </Link>
            </Button>
          </div>
          <div className="table-wrap">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>NAMA / SEKOLAH</th>
                  <th>KATEGORI</th>
                  <th>RSVP</th>
                </tr>
              </thead>
              <tbody>
                {data.invitations.slice(0, 5).map((i) => (
                  <tr key={i.id}>
                    <td>
                      <strong>{i.name}</strong>
                      <small>{i.code}</small>
                    </td>
                    <td>
                      <Badge>{i.category}</Badge>
                    </td>
                    <td>
                      <RsvpBadge value={i.rsvp} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="admin-panel">
          <div className="panel-header">
            <div>
              <h2>Aktivitas Terkini</h2>
              <p>Langkah kecil menuju acara yang istimewa</p>
            </div>
            <Activity size={17} className="text-primary" />
          </div>
          <div className="activity-list">
            {data.activities.slice(0, 5).map((a, i) => (
              <div className="activity-item" key={i}>
                <div className="activity-icon">
                  {a.text.includes("check-in") ? (
                    <Check />
                  ) : a.text.includes("dibuat") ? (
                    <Plus />
                  ) : (
                    <Clock3 />
                  )}
                </div>
                <div>
                  <p>{a.text}</p>
                  <small>{a.time}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
