export const CONTACT_EMAIL = "hello@thefeelgoodsociety.com.au";
export const CONTACT_WHATSAPP_E164 = "61430045555";
export const CONTACT_SUPPORT_SUBJECT = "Client Support Request";

export function contactWhatsAppUrl(): string {
  return `https://wa.me/${CONTACT_WHATSAPP_E164}`;
}

export function contactSupportMailto(): string {
  const subject = encodeURIComponent(CONTACT_SUPPORT_SUBJECT);
  return `mailto:${CONTACT_EMAIL}?subject=${subject}`;
}
