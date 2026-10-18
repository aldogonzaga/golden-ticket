import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/sambut/admin-layout";
import { SchoolLinksPage } from "@/components/sambut/school-portal";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/admin/school-links")({
  head: () => pageHead("Link Pendaftaran Sekolah"),
  component: Page,
});
function Page() {
  return (
    <AdminLayout>
      <SchoolLinksPage />
    </AdminLayout>
  );
}
