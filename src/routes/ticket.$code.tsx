import { createFileRoute } from "@tanstack/react-router";
import { TicketPage } from "@/components/sambut/public-pages";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/ticket/$code")({
  head: () => pageHead("Golden Ticket"),
  component: Page,
});
function Page() {
  const { code } = Route.useParams();
  return <TicketPage code={code} />;
}
