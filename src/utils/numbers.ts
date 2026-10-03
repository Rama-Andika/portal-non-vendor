export const formatNumber = (num: string | number) => {
  if (!num) return "";

  const [integerPart, decimalPart] = num
    .toString()
    .replace(/,/g, "")
    .split(".");
  const formattedInteger = Number(integerPart).toLocaleString("en-US");
  // Format the decimal part to the desired decimal places
  // const formattedDecimal = decimalPart !== undefined
  //     ? (Number(`0.${decimalPart || 0}`))
  //     : decimalPart;

  return decimalPart !== undefined
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
};

/**
 * Membulatkan ke 2 angka desimal dengan aturan half-up, menyamai `round2` backend
 * (lihat dokumen API Auto VAT bagian 4.1).
 *
 * `toPrecision(12)` dipakai untuk menetralkan galat representasi bilangan biner
 * sebelum pembulatan. Tanpa itu, `36.6663 * 100` menghasilkan `3666.6299999999997`
 * yang membulat ke bawah menjadi `36.66`, padahal backend menyimpan `36.67`.
 */
export function round2(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const scaled = Number((value * 100).toPrecision(12));
  return Math.round(scaled) / 100;
}

/**
 * Menghitung nominal VAT satu baris rincian saat Auto VAT aktif.
 *
 * Formulanya sengaja dibuat identik dengan backend, termasuk mengikutkan `qty`,
 * supaya angka preview di layar sama dengan angka yang tersimpan di database.
 */
export function calcAutoVatAmount(
  qty: number,
  price: number,
  rate: number,
  percent: number,
): number {
  const base = (qty || 0) * (price || 0) * (rate || 0);
  return round2((base * (percent || 0)) / 100);
}
