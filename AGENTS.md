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
