import { createFileRoute } from "@tanstack/react-router";
import { ScannerPage } from "@/components/sambut/scanner-page";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/admin/scanner")({
  head: () => pageHead("Scanner QR"),
  component: ScannerPage,
});
