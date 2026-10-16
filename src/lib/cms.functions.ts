import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getHalaman = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(60) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row } = await publicClient().from("halaman").select("*").eq("slug", data.slug).maybeSingle();
    return row ?? null;
  });

export const listArtikel = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("artikel").select("id,slug,judul,ringkasan,gambar,tanggal").eq("terbit", true).order("tanggal", { ascending: false });
  return data ?? [];
});

export const getArtikel = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().max(160) }).parse(d))
  .handler(async ({ data }) => {
    const { data: row } = await publicClient().from("artikel").select("*").eq("slug", data.slug).eq("terbit", true).maybeSingle();
    return row ?? null;
  });

export const listGaleri = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await publicClient().from("galeri").select("*").order("urutan").order("created_at", { ascending: false });
  return data ?? [];
});
