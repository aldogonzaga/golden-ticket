import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/sambut/admin-pages";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/admin/reports")({
  head: () => pageHead("Laporan"),
  component: ReportsPage,
});
