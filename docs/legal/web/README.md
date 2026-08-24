# Legal web pages

Generated HTML for store Privacy Policy / Terms of Service.

**Live URLs (Supabase Storage):**

- https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/privacy.html
- https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/terms.html
- https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/support.html

Rebuild and upload after editing `packages/shared/src/legal-content.ts`:

```powershell
cd "d:\feel good"
.\scripts\publish-legal-pages.ps1
```

Optional later: copy the same HTML into pages on `thefeelgoodsociety.com.au` and switch `LEGAL_URLS` back to that domain.
