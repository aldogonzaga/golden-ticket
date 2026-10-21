import { createFileRoute } from "@tanstack/react-router";
import { RsvpPage } from "@/components/sambut/public-pages";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/rsvp")({
  head: () => pageHead("Klaim Tiket"),
  component: RsvpPage,
});
