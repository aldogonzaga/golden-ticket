import { createFileRoute } from "@tanstack/react-router";
import { SchedulePage } from "@/components/sambut/public-pages";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/event/schedule")({
  head: () => pageHead("Jadwal Acara"),
  component: SchedulePage,
});
