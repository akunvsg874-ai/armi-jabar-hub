import { createFileRoute } from "@tanstack/react-router";
import { KegiatanList } from "@/components/site/KegiatanList";
import { halamanQuery, seoMeta } from "@/lib/cms";

export const Route = createFileRoute("/jadwal-eksekusi")({
  loader: ({ context }) => context.queryClient.ensureQueryData(halamanQuery("jadwal-eksekusi")),
  head: ({ loaderData }) => seoMeta(loaderData, "jadwal-eksekusi"),
  component: () => <KegiatanList slug="jadwal-eksekusi" eksekusi />,
});
