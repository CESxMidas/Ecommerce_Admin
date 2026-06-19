export const ADMIN_LOCALE = "vi-VN";
export const ADMIN_CURRENCY = "VND";

/** Định dạng giá VND giống storefront: `1.234.567 đ` */
export function formatPrice(value: number) {
  const amount = new Intl.NumberFormat(ADMIN_LOCALE, {
    maximumFractionDigits: 0,
  }).format(Math.round(value));

  return `${amount}\u00A0đ`;
}

export function formatCurrency(
  amount: number,
  currency = ADMIN_CURRENCY,
  locale = ADMIN_LOCALE,
) {
  if (currency === "VND") {
    return formatPrice(amount);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  value: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  },
) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(ADMIN_LOCALE, options).format(date);
}

export function formatDateTime(value: string | Date) {
  return formatDate(value, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat(ADMIN_LOCALE).format(value);
}

export function formatTodayVi(date = new Date()) {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Rút gọn số lớn cho thẻ thống kê (vd. 4,86 tỷ đ). */
export function formatCompactCurrency(
  amount: number,
  currency = ADMIN_CURRENCY,
  locale = ADMIN_LOCALE,
) {
  if (currency === "VND") {
    if (amount >= 1_000_000_000) {
      const value = amount / 1_000_000_000;
      return `${value.toLocaleString(locale, { maximumFractionDigits: 2 })}\u00A0tỷ\u00A0đ`;
    }

    if (amount >= 1_000_000) {
      const value = amount / 1_000_000;
      return `${value.toLocaleString(locale, { maximumFractionDigits: 1 })}\u00A0triệu\u00A0đ`;
    }

    return formatPrice(amount);
  }

  const symbol =
    currency === "USD"
      ? "US$"
      : new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
          currencyDisplay: "narrowSymbol",
        })
          .formatToParts(0)
          .find((part) => part.type === "currency")?.value ?? currency;

  if (amount >= 1_000_000) {
    const value = amount / 1_000_000;
    return `${value.toLocaleString(locale, { maximumFractionDigits: 1 })}M ${symbol}`;
  }

  if (amount >= 10_000) {
    const value = amount / 1_000;
    return `${value.toLocaleString(locale, { maximumFractionDigits: 1 })}K ${symbol}`;
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
