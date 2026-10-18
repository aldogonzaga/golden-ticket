import { createFileRoute } from "@tanstack/react-router";
import { InvitationsPage } from "@/components/sambut/invitations-page";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/admin/invitations")({
  head: () => pageHead("Undangan Seluruh Tamu"),
  component: Page,
});
function Page() {
  return <InvitationsPage />;
}
