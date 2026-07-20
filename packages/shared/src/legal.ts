export const LEGAL_URLS = {
  privacy: "https://thefeelgoodsociety.com.au/privacy",
  terms: "https://thefeelgoodsociety.com.au/terms",
  supportEmail: "hello@thefeelgoodsociety.com.au",
} as const;

/** Fallback to local web routes when production domain is not yet wired. */
export const LEGAL_URLS_DEV = {
  privacy: "http://localhost:8081/privacy",
  terms: "http://localhost:8081/terms",
} as const;
