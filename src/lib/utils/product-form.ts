import type { DeliveryType, ProductType } from "@/types/admin";

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function defaultDeliveryType(productType: ProductType): DeliveryType {
  if (productType === "hardware") return "physical";
  if (productType === "license_key" || productType === "redeem_code") {
    return "instant_key";
  }
  if (productType === "account") return "account_credentials";
  return "manual_delivery";
}

export function isPoolProductType(productType: ProductType, deliveryType: DeliveryType) {
  return (
    ["license_key", "redeem_code"].includes(productType) &&
    deliveryType === "instant_key"
  );
}

export function parseKeyImportText(text: string) {
  return text
    .split(/\r?\n|,|;/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseKeyImportFileContent(content: string) {
  const lines = content.split(/\r?\n/);
  const keys: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.includes(",")) {
      const cells = trimmed.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
      const candidate = cells.find((cell) => cell.length >= 4) || cells[0];
      if (candidate) keys.push(candidate);
      continue;
    }

    keys.push(trimmed);
  }

  return keys;
}
