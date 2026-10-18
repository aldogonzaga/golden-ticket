import { createFileRoute } from "@tanstack/react-router";
import { ScannerPage } from "@/components/sambut/scanner-page";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/check-in/$code")({
  head: () => pageHead("Konfirmasi Check-in"),
  component: Page,
});
function Page() {
  const { code } = Route.useParams();
  return <ScannerPage initialCode={code} />;
}
