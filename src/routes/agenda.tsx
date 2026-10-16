import { createFileRoute } from "@tanstack/react-router";
import { KegiatanList } from "@/components/site/KegiatanList";
import { halamanQuery, seoMeta } from "@/lib/cms";

export const Route = createFileRoute("/agenda")({
  loader: ({ context }) => context.queryClient.ensureQueryData(halamanQuery("agenda")),
  head: ({ loaderData }) => seoMeta(loaderData, "agenda"),
  component: () => <KegiatanList slug="agenda" eksekusi={false} />,
});
