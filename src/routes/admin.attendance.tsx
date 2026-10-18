import { createFileRoute } from "@tanstack/react-router";
import { AttendancePage } from "@/components/sambut/admin-pages";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/admin/attendance")({
  head: () => pageHead("Rekap Kehadiran"),
  component: AttendancePage,
});
