import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Me = Database["public"]["Tables"]["anggota"]["Row"];
export type Role = Database["public"]["Enums"]["app_role"];

export async function fetchMe(): Promise<Me | null> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return null;
  const { data } = await supabase.from("anggota").select("*").eq("user_id", u.user.id).maybeSingle();
  return data;
}

export const meQuery = queryOptions({ queryKey: ["me"], queryFn: fetchMe, staleTime: 60_000 });
