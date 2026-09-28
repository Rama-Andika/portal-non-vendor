/**
 * Formats a number as Indonesian Rupiah (IDR) currency string with English-style delimiters.
 * Example: 1500000 → "Rp1,500,000.00"
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `Rp${formatted}`;
}
