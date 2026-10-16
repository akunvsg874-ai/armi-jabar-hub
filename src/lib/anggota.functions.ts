import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generatePassword, nomorToEmail, WILAYAH_JABAR } from "./armi";

const base = z.object({
  nama_lengkap: z.string().trim().min(1).max(100),
  no_hp: z.string().trim().min(6).max(20),
  wilayah: z.enum(WILAYAH_JABAR),
  nama_usaha: z.string().trim().min(1).max(100),
  status: z.enum(["aktif", "non_aktif"]),
  role: z.enum(["admin", "bendahara", "anggota"]),
});

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (!data) throw new Error("Akses ditolak");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const createAnggota = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => base.parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context);
    const { data: nomor, error: e1 } = await admin.rpc("next_nomor_anggota");
    if (e1 || !nomor) throw new Error("Gagal membuat nomor anggota");
    const password = generatePassword();
    const { data: created, error: e2 } = await admin.auth.admin.createUser({
      email: nomorToEmail(nomor), password, email_confirm: true,
    });
    if (e2 || !created.user) throw new Error("Gagal membuat akun");
    const uid = created.user.id;
    const { error: e3 } = await admin.from("anggota").insert({ ...data, user_id: uid, nomor_anggota: nomor });
    if (e3) { await admin.auth.admin.deleteUser(uid); throw new Error("Gagal menyimpan anggota"); }
    await admin.from("user_roles").insert({ user_id: uid, role: data.role });
    return { nomor_anggota: nomor as string, password };
  });

export const updateAnggota = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => base.extend({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context);
    const { id, ...rest } = data;
    const { data: row } = await admin.from("anggota").select("user_id").eq("id", id).single();
    if (row?.user_id === context.userId && (rest.status !== "aktif" || rest.role !== "admin")) {
      throw new Error("Anda tidak bisa menonaktifkan atau menurunkan peran akun sendiri");
    }
    const { error } = await admin.from("anggota").update(rest).eq("id", id);
    if (error) throw new Error("Gagal memperbarui anggota");
    if (row?.user_id) {
      await admin.from("user_roles").delete().eq("user_id", row.user_id);
      await admin.from("user_roles").insert({ user_id: row.user_id, role: rest.role });
      await admin.auth.admin.updateUserById(row.user_id, {
        ban_duration: rest.status === "non_aktif" ? "876000h" : "none",
      });
    }
    return { ok: true };
  });

export const deleteAnggota = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context);
    const { data: row } = await admin.from("anggota").select("user_id").eq("id", data.id).single();
    if (row?.user_id === context.userId) throw new Error("Anda tidak bisa menghapus akun sendiri");
    await admin.from("anggota").delete().eq("id", data.id);
    if (row?.user_id) await admin.auth.admin.deleteUser(row.user_id);
    return { ok: true };
  });

export const resetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const admin = await assertAdmin(context);
    const { data: row } = await admin.from("anggota").select("user_id, nomor_anggota").eq("id", data.id).single();
    if (!row) throw new Error("Anggota tidak ditemukan");
    const password = generatePassword();
    if (row.user_id) {
      const { error } = await admin.auth.admin.updateUserById(row.user_id, { password });
      if (error) throw new Error("Gagal reset password");
    } else {
      const { data: created, error } = await admin.auth.admin.createUser({
        email: nomorToEmail(row.nomor_anggota), password, email_confirm: true,
      });
      if (error || !created.user) throw new Error("Gagal membuat akun login");
      const { data: full } = await admin.from("anggota").select("role").eq("id", data.id).single();
      await admin.from("anggota").update({ user_id: created.user.id }).eq("id", data.id);
      await admin.from("user_roles").insert({ user_id: created.user.id, role: full?.role ?? "anggota" });
    }
    return { nomor_anggota: row.nomor_anggota, password };
  });
