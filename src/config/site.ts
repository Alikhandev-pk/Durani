/**
 * Central business configuration.
 *
 * Only confirmed details belong here. Anything set to `null` or `false` is
 * unconfirmed and the UI hides or labels it accordingly — fill these in
 * before launch rather than adding copy elsewhere.
 */
export const site = {
  name: 'Durani Cosmetics',
  shortName: 'Durani',
  tagline: 'Pakistani skincare',
  description:
    'Shop Durani Cosmetics skincare — Durani serums (Skin Whitening, Vitamin C and Gluta White), face washes, Beauty Cream and Zafrani Skin Polish.',
  currency: 'PKR',
  locale: 'en-PK',

  /** Public site URL, used for canonical links. Not yet confirmed. */
  url: null as string | null,

  social: {
    facebook: 'https://www.facebook.com/duranicosmetics',
    instagram: 'https://www.instagram.com/duranicosmetics1',
    tiktok: 'https://www.tiktok.com/@duranicosematics',
  },

  contact: {
    /** International format without "+" or spaces, e.g. "923001234567". Enables WhatsApp ordering when set. */
    whatsapp: '923329186395' as string | null,
    /** The same number as written locally, shown to customers. */
    phone: '0332 9186395' as string | null,
    email: null as string | null,
    address: null as string | null,
  },

  /**
   * Orders are placed by sending a prefilled WhatsApp message to
   * `contact.whatsapp`; Durani confirms each order in the chat.
   * `deliveryCharge` (PKR) is null until confirmed: totals then exclude delivery.
   */
  orders: {
    deliveryCharge: null as number | null,
  },

  /** Customer promises. Leave false until the business confirms each one. */
  confirmed: {
    shipping: false,
    cashOnDelivery: false,
    returns: false,
    authenticity: false,
  },
} as const;

/** Checkout works once there is a WhatsApp number to send orders to. */
export const isCheckoutLive = site.contact.whatsapp !== null;

export function whatsappLink(message: string): string | null {
  if (!site.contact.whatsapp) return null;
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
