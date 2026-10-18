import { Link } from "@tanstack/react-router";
import { Sparkles, X, ArrowUpRight, Check, Copy } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as DialogPrimitive from "@radix-ui/react-dialog";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">
        <Sparkles strokeWidth={1.4} />
      </span>
      <span className="brand-word">
        GenZ Indonesia
        <span className="brand-year">
          2026 {!compact && <span className="brand-separator"> / </span>}
          {!compact && <span className="brand-tagline">Opening PPDB & SemiFinal</span>}
        </span>
      </span>
    </Link>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <DialogPrimitive.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="modal-backdrop" />
        <DialogPrimitive.Content
          className={`modal accessible-modal ${wide ? "modal-wide" : ""}`}
          aria-describedby={undefined}
        >
          <header>
            <DialogPrimitive.Title asChild>
              <h2>{title}</h2>
            </DialogPrimitive.Title>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Tutup">
              <X />
            </Button>
          </header>
          <div className="modal-body">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function Badge({ children, tone = "muted" }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`status-badge status-${tone}`}>
      <span />
      {children}
    </span>
  );
}
export function RsvpBadge({ value }: { value: string }) {
  return (
    <Badge tone={value === "Hadir" ? "success" : value === "Tidak Hadir" ? "danger" : "gold"}>
      {value === "Pending" ? "Menunggu" : value}
    </Badge>
  );
}
export function Empty({
  title = "Belum ada data",
  text = "Coba ubah pencarian atau tambahkan undangan baru.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className="empty-state">
      <Sparkles />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Berhasil disalin");
  } catch {
    toast.error("Tidak dapat menyalin. Silakan salin secara manual.");
  }
}
export function CopyButton({ value }: { value: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      title="Salin kode"
      aria-label="Salin kode"
      onClick={() => copyText(value)}
    >
      <Copy />
    </Button>
  );
}
export function ArrowLink({
  to,
  children,
}: {
  to: "/" | "/rsvp" | "/event/schedule" | "/event/messages" | "/admin/login";
  children: ReactNode;
}) {
  return (
    <Link to={to} className="arrow-link">
      {children}
      <ArrowUpRight size={17} />
    </Link>
  );
}
export function SavedMark() {
  return (
    <span className="saved-mark">
      <Check size={14} /> Tersimpan di perangkat
    </span>
  );
}
