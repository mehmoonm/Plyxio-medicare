export const CURRENCY_OPTIONS = [
  { code: 'PKR', label: 'Pakistani Rupee (Rs)', symbol: 'Rs' },
  { code: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { code: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { code: 'EUR', label: 'Euro (€)', symbol: '€' },
  { code: 'INR', label: 'Indian Rupee (₹)', symbol: '₹' },
  { code: 'AED', label: 'UAE Dirham (AED)', symbol: 'AED' },
  { code: 'SAR', label: 'Saudi Riyal (SAR)', symbol: 'SAR' },
];

export function currencySymbol(code?: string | null): string {
  return CURRENCY_OPTIONS.find((c) => c.code === code)?.symbol || 'Rs';
}

export function formatMoney(amount: number, currencyCode?: string | null): string {
  return `${currencySymbol(currencyCode)} ${Math.round(amount).toLocaleString()}`;
}
