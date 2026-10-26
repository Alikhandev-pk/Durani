/**
 * Product catalogue.
 *
 * Every field here is taken from the supplied photos/packaging. Fields that
 * were not supplied are `null` and the UI shows a "to be confirmed" state:
 * - `price: null`  -> purchasing disabled, "Contact for price". Never use 0 as a placeholder.
 * - `size: null`   -> "Size to be confirmed"
 * - `usage` / `ingredients: null` -> section explains details are not yet supplied
 */

export type CategorySlug = 'face-wash' | 'serums' | 'beauty-cream' | 'skin-polish';

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
  /** Generated widths. Defaults to the square product canvas (400, 800, 1200). */
  widths?: readonly number[];
  /** Intrinsic size of the largest file. Defaults to 1200×1200. */
  width?: number;
  height?: number;
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
  /**
   * Whether a transparent cutout exists in /images/cutouts. Without one, cards
   * show the first image whole (supplied posters are never cropped).
   */
  cutout: boolean;
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
  { slug: 'skin-polish', name: 'Skin Polish', navLabel: 'Skin Polish' },
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
    cutout: true,
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
    cutout: true,
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
    cutout: true,
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
    cutout: true,
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
  {
    slug: 'durani-vitamin-c-serum',
    name: 'Durani Vitamin C Serum',
    shortName: 'Durani Vitamin C Serum',
    category: 'serums',
    size: null,
    price: null,
    images: [
      {
        base: '/images/products/durani-vitamin-c-serum-poster',
        alt: 'Durani Vitamin C Serum box, white with an orange slice and orange wave, labelled 10%+ Vitamin C Serum, shown with fresh oranges',
        widths: [400, 800, 1024],
        width: 1024,
        height: 1280,
      },
    ],
    cutout: false,
    description: 'Durani Vitamin C Serum comes in a white and orange Durani retail box.',
    packagingText: [
      '10%+',
      'Vitamin C Serum',
      'Visibly brightens the skin & reduce appearance of sign of aging.',
    ],
    usage: null,
    ingredients: null,
  },
  {
    slug: 'durani-gluta-white-serum',
    name: 'Durani Gluta White Serum',
    shortName: 'Durani Gluta White Serum',
    category: 'serums',
    size: null,
    price: null,
    images: [
      {
        base: '/images/products/durani-gluta-white-serum-poster',
        alt: 'Durani Gluta White Skin Whitening Serum box in orange, white and bronze, with a dropper bottle pictured on the front',
        widths: [400, 800, 853],
        width: 853,
        height: 1280,
      },
    ],
    cutout: false,
    description: 'Durani Gluta White Serum comes in an orange, white and bronze Durani retail box.',
    packagingText: [
      '100% Natural',
      'Gluta White',
      'Skin Whitening Serum',
      'Keep Glowing Forever',
      'Skin Whitening & Anti-aging',
    ],
    usage: null,
    ingredients: null,
  },
  {
    slug: 'durani-zafrani-skin-polish',
    name: 'Durani Zafrani Skin Polish',
    shortName: 'Durani Zafrani Skin Polish',
    category: 'skin-polish',
    size: null,
    price: null,
    images: [
      {
        base: '/images/products/durani-zafrani-skin-polish-poster',
        alt: 'Durani Zafrani Skin Polish box in white, gold and purple with a saffron flower and a bowl of saffron threads',
        widths: [400, 800, 853],
        width: 853,
        height: 1280,
      },
    ],
    cutout: false,
    description: 'Durani Zafrani Skin Polish comes in a white, gold and purple Durani retail box.',
    packagingText: [
      'Zafrani Skin Polish',
      'Advanced Skin Solution',
      'Brightening Organic Skincare',
      'Multipurpose Facial',
      'For All Skin Types',
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
