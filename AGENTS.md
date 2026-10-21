<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->home.page## SAMBUT architecture
- Use TanStack Start file-based routes for all public and admin screens; this preserves the template routing and SSR model.
- Keep the current stage frontend-only with a shared context and localStorage repository; the provided master prompt explicitly requires a persistent simulation, not a production backend.
- Keep invitation and attendance invariants in the shared store, with one stable code per invitation; all views and statistics must use the same records.
- Keep feature UI in src/components/sambut and pure data/export helpers in src/lib/sambut; route files stay thin and supply per-page metadata.
- Use src/styles.css for semantic design tokens and reusable visual styles; feature markup must not hardcode colors.
