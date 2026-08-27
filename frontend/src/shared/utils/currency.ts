const formatter = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });

export function formatCurrency(value: number): string {
  return formatter.format(value);
}
