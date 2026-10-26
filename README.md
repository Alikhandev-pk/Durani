# Durani Cosmetics storefront

React 18 + TypeScript + Vite 6 + Tailwind CSS 4. React Router for pages, GSAP (with ScrollTrigger and SplitText) for animation.

## Run locally

```bash
npm install
npm run dev        # development server  -> http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build -> http://localhost:4173
npm test           # cart logic unit tests (Node's built-in test runner)
npm run images     # regenerate web images from assets/originals
```

## Where things live

| What | File |
| --- | --- |
| Business details (contact, WhatsApp, order endpoint, confirmed promises) | `src/config/site.ts` |
| Products (names, sizes, prices, pack text, usage, ingredients) | `src/data/products.ts` |
| Hero banners | `src/data/banners.ts` |
| Policy drafts | `src/data/policies.ts` |
| Navigation | `src/config/navigation.ts` |
| Original uploads (never modified) | `assets/originals/` |
| Background-removal mattes | `assets/processed/cutouts/` |
| Generated web images (incl. transparent cutouts for the hero and product cards) | `public/images/` |
| Animation setup (plugins, reduced-motion queries) | `src/lib/gsap.ts` |
| Page transitions and scroll reveals (`data-reveal`, `data-split`) | `src/components/Layout.tsx` |

## Before launch

Fill these in. The site already handles each one: when a value is `null`, the related feature is hidden or labelled "to be confirmed".

- **Prices** for all seven products (`price` in `products.ts`); until then each shows "Contact for price". Purchasing turns on per product once a price is set, and price sorting appears.
- **Sizes**: Durani Rice Face Wash, Durani Beauty Cream, Durani Vitamin C Serum, Durani Gluta White Serum and Durani Zafrani Skin Polish.
- **Usage directions and ingredient lists** for each product.
- **Delivery charge**: set `site.orders.deliveryCharge` (PKR). Until then checkout and the WhatsApp message show delivery as "To be confirmed" and the total as excluding delivery.
- **WhatsApp ordering** uses `site.contact.whatsapp` (923329186395). Checkout opens WhatsApp with a prefilled order message; the customer presses Send and Durani confirms in the chat.
- **Phone, email, address** (optional) are shown on the Contact page when set.
- **Delivery charges, delivery areas, payment methods (COD), returns**: write the policies in `policies.ts` and set `status: 'confirmed'`.
- **Domain** (`site.url`). Once it is known, make the `og:image` and schema `logo` URLs in `index.html` absolute.
- **Logo**: the official logo is in use, but the only file supplied is 160×160 px. Put a larger copy (at least 640 px) at `assets/originals/logo/durani-logo.jpg` and run `npm run images` for a sharper logo and favicon.
- Product structured data (schema.org `Product`) is left out on purpose until prices are confirmed.
- Deploying as a single-page app needs a host rewrite that sends all routes to `index.html`.
