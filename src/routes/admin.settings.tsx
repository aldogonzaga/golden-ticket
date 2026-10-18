import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/sambut/admin-pages";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/admin/settings")({
  head: () => pageHead("Pengaturan Acara"),
  component: SettingsPage,
});
