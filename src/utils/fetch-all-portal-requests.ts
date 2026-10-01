import { getPortalRequestsList } from "@/api/non-vendor.api";
import type {
  GetPortalRequestsParams,
  PortalRequestItem,
} from "@/types/portal-request.type";

/**
 * Ukuran halaman (size) yang digunakan saat mengambil data untuk export.
 *
 * CATATAN PENTING:
 * Jika backend membatasi ukuran halaman maksimum (misal hanya mengizinkan size
 * sampai 100), pastikan nilai ini TIDAK melebihi batas tersebut.
 * Jika ragu, ubah nilai ini menjadi nilai `size` yang biasa dipakai halaman
 * (misal 10 atau 20). Menggunakan nilai kecil tetap benar, hanya lebih lambat.
 */
const EXPORT_PAGE_SIZE = 100;

/**
 * Mengambil SELURUH data portal requests (semua halaman) sesuai filter,
 * kemudian mengembalikannya sebagai satu array datar.
 *
 * Alur:
 * 1. Ambil halaman pertama (page = 0) untuk mengetahui total halaman.
 * 2. Jika hanya ada 1 halaman (atau tidak ada data), kembalikan datanya.
 * 3. Jika lebih dari 1 halaman, ambil sisa halaman secara paralel.
 * 4. Gabungkan semua data menjadi satu array.
 *
 * @param params  Parameter filter yang SAMA dengan yang dipakai tabel list.
 *                Nilai `page` dan `size` di dalamnya akan ditimpa oleh fungsi ini.
 * @returns       Array berisi seluruh PortalRequestItem.
 */
export async function fetchAllPortalRequests(
  params: GetPortalRequestsParams,
): Promise<PortalRequestItem[]> {
  // 1. Ambil halaman pertama
  const firstResponse = await getPortalRequestsList({
    ...params,
    page: 0,
    size: EXPORT_PAGE_SIZE,
  });

  const totalPages = firstResponse.pagination?.totalPages ?? 0;
  const firstPageData = firstResponse.data ?? [];

  // 2. Jika tidak ada halaman lain, kembalikan data halaman pertama
  if (totalPages <= 1) {
    return firstPageData;
  }

  // 3. Buat daftar nomor halaman yang tersisa: [1, 2, 3, ...]
  const remainingPageNumbers = Array.from(
    { length: totalPages - 1 },
    (_, index) => index + 1,
  );

  // 4. Ambil sisa halaman secara paralel
  const remainingResponses = await Promise.all(
    remainingPageNumbers.map((page) =>
      getPortalRequestsList({
        ...params,
        page,
        size: EXPORT_PAGE_SIZE,
      }),
    ),
  );

  // 5. Gabungkan data dari sisa halaman
  const remainingData = remainingResponses.flatMap(
    (response) => response.data ?? [],
  );

  return [...firstPageData, ...remainingData];
}
