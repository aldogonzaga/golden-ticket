import { createFileRoute } from "@tanstack/react-router";
import { SchoolPortalPage } from "@/components/sambut/school-portal";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/sekolah/$code")({
  head: () => pageHead("Pendaftaran Peserta Sekolah", "Isi data peserta sekolah dan dapatkan Golden Ticket atas nama masing-masing."),
  component: Page,
});
function Page() {
  const { code } = Route.useParams();
  return <SchoolPortalPage code={code} />;
}
