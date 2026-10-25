/**
 * Product catalogue.
 *
 * Every field here is taken from the supplied photos/packaging. Fields that
 * were not supplied are `null` and the UI shows a "to be confirmed" state:
 * - `price: null`  -> purchasing disabled, "Price to be confirmed"
 * - `size: null`   -> "Size to be confirmed"
 * - `usage` / `ingredients: null` -> section explains details are not yet supplied
 */

export type CategorySlug = 'face-wash' | 'serums' | 'beauty-cream';

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Short label for navigation. */
  navLabel: string;
}

export interface ProductImage {
  /** Base path without size suffix or extension, e.g. /images/products/durani-serum */
  base: string;
  alt: string;
}

export interface Product {
  slug: string;
  name: string;
  /** Name used on the campaign banner. */
  shortName: string;
  category: CategorySlug;
  /** As printed on pack. */
  size: string | null;
  /** In PKR. */
  price: number | null;
  images: ProductImage[];
  description: string;
  /** Text clearly legible on the packaging, reproduced verbatim. */
  packagingText: string[];
  usage: string | null;
  ingredients: string | null;
}

export const categories: Category[] = [
  { slug: 'face-wash', name: 'Face Wash', navLabel: 'Face Wash' },
  { slug: 'serums', name: 'Serums', navLabel: 'Serums' },
  { slug: 'beauty-cream', name: 'Beauty Cream', navLabel: 'Beauty Cream' },
];

export const products: Product[] = [
  {
    slug: 'durani-skin-whitening-serum',
    name: 'Durani Skin Whitening Serum',
    shortName: 'Durani Serum',
    category: 'serums',
    size: '30 ml / 1.1 fl oz',
    price: null,
    images: [
      {
        base: '/images/products/durani-skin-whitening-serum',
        alt: 'Durani Skin Whitening Serum, 30 ml, in its white and yellow retail box',
      },
    ],
    description:
      'Durani Skin Whitening Serum comes in a 30 ml dropper bottle, packed in a white and yellow Durani retail box.',
    packagingText: [
      'Unlock Your Natural Beauty',
      '100% Natural',
      'Skin Whitening Serum',
      '30 ml / 1.1 Fl Oz',
    ],
    usage: null,
    ingredients: null,
  },
  {
    slug: 'durani-skin-brightening-face-wash',
    name: 'Durani Skin Brightening Face Wash',
    shortName: 'Durani Face Wash',
    category: 'face-wash',
    size: '120 ml / 4 fl oz',
    price: null,
    images: [
      {
        base: '/images/products/durani-skin-brightening-face-wash',
        alt: 'Durani Skin Brightening Face Wash, 120 ml white tube with yellow bands and a flip cap',
      },
    ],
    description: 'Durani Skin Brightening Face Wash comes in a 120 ml tube with a flip cap.',
    packagingText: [
      '100% Natural',
      'Skin Brightening Face Wash',
      'Benefits Of Gluta White FaceWash:',
      'Deep Cleansing the Face.',
      'Remove impurities from Face.',
      'Remove unwanted oil from Face.',
      'Give bright and radiant Skin.',
      'Give freshness that is long lasting.',
      'Maintain white and glowing complexion.',
      'Remove dead cells from Face.',
      '4 Fl Oz, 120 ml',
    ],
    usage: null,
    ingredients: null,
  },
  {
    slug: 'durani-rice-face-wash',
    name: 'Durani Rice Face Wash',
    shortName: 'Durani Rice Face Wash',
    category: 'face-wash',
    size: null,
    price: null,
    images: [
      {
        base: '/images/products/durani-rice-face-wash',
        alt: 'Durani Rice Skin Whitening + Glowing Face Wash in a white and cream tube with gold accents',
      },
    ],
    description: 'Durani Rice Face Wash comes in a white and cream tube with gold detailing and a flip cap.',
    packagingText: ['Rice', 'Skin Whitening + Glowing', 'Face Wash', 'Skin Rejuvenation'],
    usage: null,
    ingredients: null,
  },
  {
    slug: 'durani-beauty-cream',
    name: 'Durani Beauty Cream with Avocado & Aloe Vera',
    shortName: 'Durani Beauty Cream',
    category: 'beauty-cream',
    size: null,
    price: null,
    images: [
      {
        base: '/images/products/durani-beauty-cream',
        alt: 'Durani Beauty Cream with Avocado & Aloe Vera in its yellow and white box',
      },
    ],
    description: 'Durani Beauty Cream with Avocado & Aloe Vera comes in a yellow and white Durani box.',
    packagingText: [
      '30 SPF',
      'Beauty Cream',
      'with Avocado & Aloe Vera',
      '7 Days Recovery',
      'anti wrinkle, anti ageing',
      'black spots, freckles & for fairer skin',
    ],
    usage: null,
    ingredients: null,
  },
];

export function getProduct(slug: string | undefined): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string | undefined): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function isPurchasable(product: Product): product is Product & { price: number } {
  return typeof product.price === 'number' && product.price > 0;
}

export function relatedProducts(product: Product, limit = 3): Product[] {
  const same = products.filter((p) => p.slug !== product.slug && p.category === product.category);
  const others = products.filter((p) => p.slug !== product.slug && p.category !== product.category);
  return [...same, ...others].slice(0, limit);
}

export function searchProducts(query: string, list: Product[] = products): Product[] {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return list;
  return list.filter((p) => {
    const category = getCategory(p.category)?.name ?? '';
    const haystack = [p.name, p.shortName, category, p.description, ...p.packagingText]
      .join(' ')
      .toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}
