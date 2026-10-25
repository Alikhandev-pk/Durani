/**
 * Policy pages. None of these have been confirmed by the business, so each is
 * published as a clearly marked draft that lists only the points still to be
 * decided — no terms are stated. Replace `sections` with approved wording and
 * set `status: 'confirmed'` once reviewed.
 */
export interface Policy {
  slug: string;
  title: string;
  status: 'draft' | 'confirmed';
  /** Topics the final policy needs to cover. */
  sections: { heading: string; body: string }[];
}

const pending = 'To be confirmed by Durani Cosmetics.';

export const policies: Policy[] = [
  {
    slug: 'shipping',
    title: 'Shipping Policy',
    status: 'draft',
    sections: [
      { heading: 'Delivery areas', body: pending },
      { heading: 'Delivery times', body: pending },
      { heading: 'Delivery charges', body: pending },
      { heading: 'Payment methods', body: pending },
    ],
  },
  {
    slug: 'returns',
    title: 'Returns & Refunds',
    status: 'draft',
    sections: [
      { heading: 'Eligibility for returns', body: pending },
      { heading: 'How to request a return', body: pending },
      { heading: 'Refunds', body: pending },
      { heading: 'Damaged or incorrect items', body: pending },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    status: 'draft',
    sections: [
      { heading: 'Information we collect', body: pending },
      { heading: 'How information is used', body: pending },
      { heading: 'Data storage and retention', body: pending },
      { heading: 'Contact for privacy questions', body: pending },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    status: 'draft',
    sections: [
      { heading: 'Orders and pricing', body: pending },
      { heading: 'Product information', body: pending },
      { heading: 'Liability', body: pending },
      { heading: 'Governing law', body: pending },
    ],
  },
];

export function getPolicy(slug: string | undefined): Policy | undefined {
  return policies.find((p) => p.slug === slug);
}
