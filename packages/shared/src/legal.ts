export const LEGAL_URLS = {
  privacy: "https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/privacy.html",
  terms: "https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/terms.html",
  support: "https://bruvmdcstlkszvjruska.supabase.co/storage/v1/object/public/legal/support.html",
  supportEmail: "hello@thefeelgoodsociety.com.au",
} as const;

/** Fallback to local web routes when production domain is not yet wired. */
export const LEGAL_URLS_DEV = {
  privacy: "http://localhost:8081/privacy",
  terms: "http://localhost:8081/terms",
} as const;
