import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const kegiatanQuery = queryOptions({
  queryKey: ["kegiatan"],
  queryFn: async () => {
    const { data, error } = await supabase.from("kegiatan").select("*").order("tanggal", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const transaksiQuery = queryOptions({
  queryKey: ["transaksi"],
  queryFn: async () => {
    const { data, error } = await supabase.from("transaksi").select("*").order("tanggal", { ascending: false }).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

export const anggotaListQuery = queryOptions({
  queryKey: ["anggota-list"],
  queryFn: async () => {
    const { data, error } = await supabase.from("anggota").select("*").order("nomor_anggota");
    if (error) throw error;
    return data;
  },
});
