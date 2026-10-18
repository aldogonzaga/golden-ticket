import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/sambut/public-pages";
import { pageHead } from "@/lib/sambut/utils";
export const Route = createFileRoute("/")({
  head: () => pageHead("Opening PPDB & SemiFinal Maheswara Maheswari 2027"),
  component: HomePage,
});
