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
    'Shop Durani Cosmetics skincare — Durani Serum, Durani Face Wash, Durani Rice Face Wash and Durani Beauty Cream.',
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
    whatsapp: null as string | null,
    phone: null as string | null,
    email: null as string | null,
    address: null as string | null,
  },

  /**
   * Order handling. While `endpoint` is null the checkout runs in demo mode:
   * no order is sent and no success message is shown.
   */
  orders: {
    endpoint: null as string | null,
  },

  /** Customer promises. Leave false until the business confirms each one. */
  confirmed: {
    shipping: false,
    cashOnDelivery: false,
    returns: false,
    authenticity: false,
  },
} as const;

export const isCheckoutLive = site.orders.endpoint !== null;

export function whatsappLink(message: string): string | null {
  if (!site.contact.whatsapp) return null;
  return `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
