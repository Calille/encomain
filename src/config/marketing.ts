export const MARKETING_CONFIG = {
  cal: {
    username: "josh-wicks-6g1goc",
    eventSlug: "intro-call",
    namespace: "intro-call",
    // Full calLink for @calcom/embed-react
    calLink: "josh-wicks-6g1goc/intro-call",
  },
  whatsapp: {
    // International format, no leading + or 0
    number: "447877700777",
    // Pre-filled message shown when the user opens the chat
    defaultMessage: "Hi, I'd like to chat about a project.",
  },
};

/** Convenience helper for WhatsApp click-to-chat URLs */
export function whatsappLink(customMessage?: string): string {
  const message = customMessage ?? MARKETING_CONFIG.whatsapp.defaultMessage;
  return `https://wa.me/${MARKETING_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
}
