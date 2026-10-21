import { useState, type ReactNode } from "react";
import { Link, useRouterState, Navigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ScanLine,
  ClipboardCheck,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Menu,
  MoreHorizontal,
  ArrowUpRight,
  Tickets,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSambut } from "@/lib/sambut/store";
import { Brand, Empty } from "./shared";
const nav = [
  ["Ringkasan", "/admin/dashboard", LayoutDashboard],
  ["Semua Undangan", "/admin/invitations", Tickets],
  ["Link Sekolah", "/admin/school-links", Link2],
  ["Scanner QR", "/admin/scanner", ScanLine],
  ["Rekap Kehadiran", "/admin/attendance", ClipboardCheck],
  ["Laporan", "/admin/reports", ChartNoAxesCombined],
  ["Pengaturan", "/admin/settings", Settings],
] as const;
export function AdminLayout({ children }: { children: ReactNode }) {
  const { loggedIn, ready, logout, connectedToDb } = useSambut();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  if (!ready) return <Empty title="Menyiapkan ruang panitia…" text="" />;
  if (!loggedIn) return <Navigate to="/admin/login" />;
  return (
    <div className={`admin-app ${collapsed ? "collapsed" : ""}`}>
      <aside className="admin-sidebar">
        <Brand compact />
        <div className="sidebar-section">RUANG PANITIA</div>
        <nav className="sidebar-nav">
          {nav.map(([label, to, Icon]) => (
            <Link key={to} to={to} className={path === to ? "active" : ""} title={label}>
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <nav className="sidebar-nav">
            <Link to="/">
              <ArrowUpRight />
              <span>Lihat Website Acara</span>
            </Link>
            <Link to="/admin/login" onClick={logout}>
              <LogOut />
              <span>Keluar</span>
            </Link>
          </nav>
          <div className="demo-label" title={connectedToDb ? "Terhubung ke Database MySQL (Laravel 12)" : "Mode Demo Offline"}>
            <span style={connectedToDb ? { background: "#10b981" } : {}} />
            {connectedToDb ? "TERHUBUNG · MYSQL" : "MODE DEMO · DATA LOKAL"}
          </div>
        </div>
      </aside>
      <div className="admin-body">
        <header className="admin-header">
          <div className="admin-header-left">
            <Button
              variant="ghost"
              size="icon"
              className="admin-menu-toggle"
              title="Atur navigasi"
              aria-label="Atur navigasi"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu />
            </Button>
            <span>
              Ruang Panitia <span className="text-primary px-2">/</span> 2027
            </span>
          </div>
          <div className="admin-header-right">
            <Button asChild size="sm" className="scan-header-button">
              <Link to="/admin/scanner">
                <ScanLine />
                Buka Scanner
              </Link>
            </Button>
            <div className="admin-user">
              <div className="admin-avatar">AD</div>
              <div>
                <strong>Administrator</strong>
                <small>Panitia 2027</small>
              </div>
            </div>
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </div>
      {moreOpen && (
        <>
          <button
            type="button"
            className="admin-more-backdrop"
            aria-label="Tutup menu lainnya"
            onClick={() => setMoreOpen(false)}
          />
          <div className="admin-more-menu" id="admin-more-menu">
            <div className="admin-more-title">Menu lainnya</div>
            {[
              ["Link Sekolah", "/admin/school-links", Link2],
              ["Laporan", "/admin/reports", ChartNoAxesCombined],
              ["Pengaturan", "/admin/settings", Settings],
            ].map(([label, to, Icon]) => {
              const ItemIcon = Icon as typeof Link2;
              return (
                <Link
                  key={String(to)}
                  to={to as "/admin/school-links" | "/admin/reports" | "/admin/settings"}
                  onClick={() => setMoreOpen(false)}
                >
                  <ItemIcon />
                  {String(label)}
                </Link>
              );
            })}
            <Link to="/" onClick={() => setMoreOpen(false)}>
              <ArrowUpRight />
              Lihat Website Acara
            </Link>
            <Link to="/admin/login" onClick={logout}>
              <LogOut />
              Keluar
            </Link>
          </div>
        </>
      )}
      <nav className="admin-mobile-tabs" aria-label="Navigasi admin mobile">
        <Link to="/admin/dashboard" className={path === "/admin/dashboard" ? "active" : ""}>
          <LayoutDashboard />
          <span>Ringkasan</span>
        </Link>
        <Link to="/admin/invitations" className={path === "/admin/invitations" ? "active" : ""}>
          <Tickets />
          <span>Undangan</span>
        </Link>
        <Link to="/admin/scanner" className="mobile-scan-tab" aria-label="Buka Scanner QR">
          <ScanLine />
          <span>Scanner</span>
        </Link>
        <Link to="/admin/attendance" className={path === "/admin/attendance" ? "active" : ""}>
          <ClipboardCheck />
          <span>Kehadiran</span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          aria-expanded={moreOpen}
          aria-controls="admin-more-menu"
          onClick={() => setMoreOpen(!moreOpen)}
        >
          <MoreHorizontal />
          <span>Lainnya</span>
        </Button>
      </nav>
    </div>
  );
}
