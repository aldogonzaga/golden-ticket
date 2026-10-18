import { createFileRoute } from "@tanstack/react-router";
import { MessagesPage } from "@/components/sambut/public-pages";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/event/messages")({
  head: () => pageHead("Kesan & Pesan"),
  component: MessagesPage,
});
