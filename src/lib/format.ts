import { site } from '../config/site';

const formatter = new Intl.NumberFormat(site.locale, {
  style: 'currency',
  currency: site.currency,
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
});

/** Formats a PKR amount, e.g. "PKR 1,500". */
export function formatPrice(amount: number): string {
  return formatter.format(amount).replace(/\u00a0/g, ' ');
}
