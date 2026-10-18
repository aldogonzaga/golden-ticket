import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/sambut/dashboard-page";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/admin/dashboard")({
  head: () => pageHead("Ruang Panitia"),
  component: DashboardPage,
});
