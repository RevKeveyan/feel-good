/**
 * Contact email — configurable via VITE_CONTACT_EMAIL build env,
 * with a sensible default so pages never show a placeholder.
 */
export const CONTACT_EMAIL: string =
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ??
  "hello@thefeelgoodsociety.com.au";
