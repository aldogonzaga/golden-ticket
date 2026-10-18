import { createFileRoute } from "@tanstack/react-router";
import { InvitationsPage } from "@/components/sambut/invitations-page";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/admin/parents")({
  head: () => pageHead("Undangan Orang Tua/Wali"),
  component: Page,
});
function Page() {
  return <InvitationsPage category="Orang Tua/Wali" />;
}
