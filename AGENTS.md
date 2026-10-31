<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Login uses member number mapped to synthetic email `<nomor lowercase>@armi.local`; accounts are only created by admin server functions (src/lib/anggota.functions.ts) — no self-signup.
- Roles are enforced via `user_roles` + `has_role` in RLS; `anggota.role` is a display copy kept in sync by admin functions.
- Public page content/SEO lives in `halaman` (one row per page slug) merged over code defaults in `src/lib/cms.ts`; why: pages render even before admins save anything.
- Uploaded images go to the private `media` bucket and are stored as long-lived signed URLs; why: public buckets are blocked on this project.
- SK (surat_keputusan) QR codes always encode `SK_SITE_URL` (src/lib/sk.ts) + `/verifikasi-sk/<kode>`; public reads go only through the `verifikasi_sk` security-definer function; why: printed QR must survive host changes and the table itself stays admin-only.
