/**
 * Utilitas untuk menghasilkan dan mengunduh file CSV.
 *
 * Catatan penting:
 * - Menggunakan separator titik-koma (;) agar aman dibuka di Microsoft Excel
 *   dengan locale Indonesia (koma dipakai sebagai pemisah desimal).
 * - Menambahkan BOM (\uFEFF) agar karakter UTF-8 terbaca benar di Excel.
 */

/**
 * Meng-escape satu nilai sel agar aman dimasukkan ke dalam baris CSV.
 *
 * Aturan:
 * 1. Nilai null/undefined diubah menjadi string kosong.
 * 2. Nilai yang diawali karakter =, +, -, atau @ diberi prefix "'" (petik satu)
 *    untuk mencegah "formula injection" di Excel.
 * 3. Nilai yang mengandung titik-koma (;), koma (,), tanda kutip ("),
 *    atau baris baru (\n / \r) dibungkus dengan tanda kutip ganda.
 *    Tanda kutip ganda di dalam nilai digandakan ("").
 */
function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  let text = String(value);

  // Cegah formula injection (sel diawali = + - @ akan dieksekusi Excel)
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  // Bungkus dengan kutip ganda jika mengandung karakter khusus
  if (/[";\n\r,]/.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

/**
 * Mengubah header dan baris data menjadi satu string CSV utuh.
 *
 * @param headers  Array judul kolom (baris pertama CSV).
 * @param rows     Array dua dimensi berisi nilai setiap sel.
 * @returns        String CSV dengan baris dipisahkan \r\n (standar Windows).
 */
export function convertToCsv(
  headers: string[],
  rows: unknown[][],
): string {
  const lines: string[] = [];

  // Baris header
  lines.push(headers.map((h) => escapeCsvCell(h)).join(";"));

  // Baris data
  for (const row of rows) {
    lines.push(row.map((cell) => escapeCsvCell(cell)).join(";"));
  }

  return lines.join("\r\n");
}

/**
 * Mengunduh string CSV sebagai file di browser.
 *
 * @param csv       String CSV yang akan diunduh.
 * @param filename  Nama file hasil unduhan (contoh: "invoices_2026-09-30.csv").
 */
export function downloadCsv(csv: string, filename: string): void {
  // BOM UTF-8 agar Excel mengenali encoding dengan benar
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Bersihkan memori object URL
  URL.revokeObjectURL(url);
}
