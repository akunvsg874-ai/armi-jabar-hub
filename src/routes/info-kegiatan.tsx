import { createFileRoute, redirect } from "@tanstack/react-router";

// Old URL kept working: permanently moved to /agenda.
export const Route = createFileRoute("/info-kegiatan")({
  beforeLoad: () => { throw redirect({ to: "/agenda", statusCode: 301 }); },
});
