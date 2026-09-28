export function toValidNumber(value: unknown, fallback = 0): number {
  if (typeof value === "string") {
    // Hapus semua spasi
    const trimmed = value.trim();
    // Ganti format US (10,000.20) -> 10000.20
    const cleaned = trimmed.replace(/,/g, "");

    const num = Number(cleaned);
    return Number.isNaN(num) ? fallback : num;
  }

  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}

