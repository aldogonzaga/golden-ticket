import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/sambut/admin-pages";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/admin/login")({
  head: () => pageHead("Login Panitia"),
  component: LoginPage,
});
