import type { Invitation } from "./store";
export const BRAND = "Opening PPDB & SemiFinal Maheswara Maheswari 2027";
export const pageHead = (
  title: string,
  description = "Undangan digital, Golden Ticket, dan pengelolaan kehadiran Opening PPDB & SemiFinal Maheswara Maheswari 2027.",
) => ({
  meta: [
    { title: title === BRAND ? title : `${title} — ${BRAND}` },
    { name: "description", content: description },
    { property: "og:title", content: title === BRAND ? title : `${title} — ${BRAND}` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
export async function exportData(rows: Invitation[], format: "csv" | "xlsx" = "xlsx") {
  const XLSX = await import("xlsx");
  const safe = (value: string) => (/^[=+@\-\t\r]/.test(value) ? `'${value}` : value);
  const data = rows.map((i) => ({
    Kode: i.code,
    Nama: safe(i.name),
    Kategori: i.category,
    "Kepala sekolah": safe(i.principal),
    Instansi: safe(i.institution),
    Kuota: i.quota,
    Terdaftar: i.category === "SMP" ? i.members.length : i.quota,
    RSVP: i.rsvp,
    "Check-in": i.checked,
    "Tempat duduk": safe(i.seat),
    MOU: i.category === "SMP" ? i.mou : "—",
  }));
  const sheet = XLSX.utils.json_to_sheet(data);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Undangan Maheswara");
  XLSX.writeFile(book, `Opening-PPDB-SemiFinal-Maheswara-Maheswari-2027.${format}`, {
    bookType: format === "csv" ? "csv" : "xlsx",
  });
}
export function eventDate(date: string) {
  return date
    ? new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "Tanggal ";
}
export function inviteURL(code: string) {
  return `${window.location.origin}/?undangan=${encodeURIComponent(code)}`;
}