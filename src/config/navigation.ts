export interface NavItem {
  label: string;
  to: string;
  /** Match the path exactly (so "Shop All" isn't active on category pages). */
  end?: boolean;
}

export const mainNav: NavItem[] = [
  { label: 'Home', to: '/', end: true },
  { label: 'Shop All', to: '/shop', end: true },
  { label: 'Face Wash', to: '/shop/face-wash' },
  { label: 'Serums', to: '/shop/serums' },
  { label: 'Beauty Cream', to: '/shop/beauty-cream' },
  { label: 'Skin Polish', to: '/shop/skin-polish' },
  { label: 'Contact', to: '/contact' },
];

export const policyNav: NavItem[] = [
  { label: 'Shipping Policy', to: '/policies/shipping' },
  { label: 'Returns & Refunds', to: '/policies/returns' },
  { label: 'Privacy Policy', to: '/policies/privacy' },
  { label: 'Terms of Service', to: '/policies/terms' },
];
