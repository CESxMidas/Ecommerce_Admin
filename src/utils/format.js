export function parsePrice(value) {
  return Number(String(value).replace(/[^0-9.]/g, "")) || 0;
}

export function formatCurrency(amount) {
  return `$${amount.toFixed(2)}`;
}
