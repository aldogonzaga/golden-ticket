import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ArrowUpRight, Menu, X, Flower2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "./shared";
import { useSambut } from "@/lib/sambut/store";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { data } = useSambut();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = [
    ["Acara", "/"],
    ["Jadwal", "/event/schedule"],
  ] as const;

  // Nomor cadangan langsung jika data.settings.contact kosong
  const fallbackContact = "+62812-8866-6916";
  const contactNumber = data?.settings?.contact || fallbackContact;
  const formattedWaNumber = contactNumber.replace(/^0/, "62").replace(/\D/g, "");

  return (
    <div className="public-app">
      <header className="public-header">
        <div className="public-nav page-width">
          <Brand />
          <nav className={open ? "public-links is-open" : "public-links"}>
            {nav.map(([label, to]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={path === to ? "active" : ""}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="nav-actions">
            <Button asChild className="nav-rsvp" variant="outline">
              <Link to="/rsvp">
                Klaim Tiket
                <ArrowUpRight />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Buka navigasi"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="public-footer">
        <div className="page-width footer-top">
          <div className="footer-brand">
            <Brand compact />
            <p>
              Merawat budaya. Menyalakan cita.
              <br />
              Merayakan setiap langkah generasi berprestasi.
            </p>
          </div>
          <nav className="footer-navigation" aria-label="Navigasi footer">
            <strong>Jelajahi</strong>
            {nav.map(([label, to]) => (
              <Link key={to} to={to}> 
                {label}
              </Link>
            ))}
            <Link to="/rsvp">Klaim Tiket</Link>
          </nav>
          <div className="footer-contact">
            <strong>Hubungi Kami</strong>
            <a
              href={`https://wa.me/${formattedWaNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {contactNumber}
            </a>
          </div>
        </div>
        <div className="page-width footer-bottom">
          © 2026 GenZ Indonesia. Seluruh hak cipta dilindungi. <Link to="/admin/login" className="admin-acces">
          akses panitia
          </Link>
          <span>
            <Flower2 size={13} /> 
          </span>
        </div>
      </footer>
    </div>
  );
}