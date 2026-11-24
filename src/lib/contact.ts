/**
 * Contact details — configurable via build env vars, with sensible defaults
 * so pages never show a placeholder.
 */
export const CONTACT_EMAIL: string =
  (import.meta.env.VITE_CONTACT_EMAIL as string | undefined) ??
  "hello@thefeelgoodsociety.com.au";

/** Subject line used when the app opens an email to the support inbox. */
export const EMAIL_SUBJECT: string = "Client Support Request";

/** Email link, opened with the subject already filled in. */
export const EMAIL_LINK: string = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
  EMAIL_SUBJECT,
)}`;

/** WhatsApp number in international digits only (no +, spaces or punctuation). */
export const WHATSAPP_NUMBER: string =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? "61430045555";

/** Human-readable form shown in the UI. */
export const WHATSAPP_DISPLAY: string =
  (import.meta.env.VITE_WHATSAPP_DISPLAY as string | undefined) ?? "+61 430 045 555";

/** Direct-chat link, pre-filled with a short opening message. */
export const WHATSAPP_LINK: string = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Suzi, I'd like to know more about The Feel Good Challenge.",
)}`;
