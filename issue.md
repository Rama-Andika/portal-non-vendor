# Task: Navigasi ke Halaman Detail Setelah Create Invoice Berhasil

## Deskripsi
Saat ini, setelah user berhasil membuat invoice baru melalui halaman `src/routes/_non-vendor/invoices/new.tsx`, sistem mengarahkan user kembali ke halaman daftar invoice (`/invoices`). 
Tugas ini adalah untuk mengubah alur navigasi tersebut. Ketika proses _create invoice_ berhasil, user harus diarahkan ke halaman detail invoice yang baru saja dibuat (yaitu route `src/routes/_non-vendor/invoices/$id.detail.tsx`).

## Aturan Keseluruhan (Strict Guidelines)
1. **DILARANG KERAS** menggunakan tipe data `any`.
2. Terapkan **Best Practices**, **Clean Code**, dan **Modular** design.
3. Pastikan kode mudah dikelola (*maintainable*) dan *scalable*.
4. Tidak boleh ada *code smell* (seperti nested logic yang tidak perlu, variabel yang tidak digunakan, dll).
5. Pertahankan UI/UX yang baik, tampilkan *loading state*, dan berikan *feedback* yang jelas (seperti *toast/snackbar*) sebelum navigasi.

---

## Tahapan Implementasi Detail

Ikuti instruksi berikut dengan teliti. Dilarang melompati tahapan-tahapan yang disediakan.

### Tahap 1: Definisikan Tipe Data untuk Response Pembuatan Invoice
Kita harus memastikan kembalian dari API ter-tipe dengan kuat (*strongly typed*) untuk menghindari penggunaan `any`.

1. Buka file tempat mendefinisikan tipe data *portal request* (misal: `src/types/portal-request.type.ts`).
2. Buat sebuah `interface` atau `type` baru yang mendeskripsikan response sukses dari proses *create invoice*. Misalnya `CreatePortalRequestResponse`.
3. Pastikan di dalam *interface* tersebut terdapat properti yang menyimpan ID invoice baru (misalnya `id: string` atau `requestId: string`, sesuaikan dengan struktur *payload* dari *backend*).

### Tahap 2: Update Tipe Kembalian Fungsi API
Langkah ini bertujuan untuk memastikan fungsi *fetcher* (API call) kita memberikan tipe data yang benar.

1. Buka file API terkait, yaitu `src/api/non-vendor.api.ts`.
2. Cari fungsi `createPortalRequest`.
3. Ubah kembalian fungsi (*return type*) yang awalnya kemungkinan berupa `Promise<TResponse<any>>` menjadi `Promise<TResponse<CreatePortalRequestResponse>>` (gunakan tipe data yang dibuat pada Tahap 1).
4. Lakukan hal yang sama untuk fungsi *mutation* di `src/queries/non-vendor.queries.ts` (pada bagian `useCreatePortalRequestMutation`) jika diperlukan agar tipe *response* bisa ter-*infer* dengan baik.

### Tahap 3: Update Argumen `onSuccess` di Form Submit
Langkah ini menangkap data *response* yang berisi ID invoice yang baru dibuat.

1. Buka file `src/routes/_non-vendor/invoices/new.tsx`.
2. Cari fungsi `handleConfirmSubmit`. Di dalam fungsi tersebut, terdapat pemanggilan fungsi `createRequest`.
3. Pada blok parameter kedua dari `createRequest`, cari fungsi *callback* `onSuccess: () => { ... }`.
4. Ubah fungsi `onSuccess` agar menerima argumen parameter berupa respons dari hasil mutasi. Contohnya: `onSuccess: (response) => { ... }` atau sesuaikan struktur parameternya dengan standar *TanStack React Query*.

### Tahap 4: Terapkan Navigasi Dinamis Secara Type-Safe
Langkah ini akan mengganti navigasi *hardcoded* dengan navigasi dinamis menuju halaman detail invoice.

1. Masih di dalam file `src/routes/_non-vendor/invoices/new.tsx` dan di dalam blok `onSuccess`.
2. Ekstrak nilai `id` invoice baru dari data argumen `response` yang diterima (misal: `const newInvoiceId = response.data?.id;`).
3. Tambahkan validasi singkat. Jika `newInvoiceId` karena alasan tertentu tidak ditemukan, fallback navigasi ke `/invoices`.
4. Ubah implementasi fungsi `navigate({ to: "/invoices" })` yang sudah ada menjadi:
   - Navigasi ke *path* tujuan: `/invoices/$id/detail` (atau sesuaikan dengan penamaan *route* TanStack Router yang tepat).
   - Sisipkan parameter *path* (`params`) berupa `id: newInvoiceId`.
5. Pastikan komponen `toast` untuk menampilkan pesan sukses tetap dipanggil *sebelum* atau *bersamaan* saat menjalankan fungsi `navigate`.

### Tahap 5: Pemeriksaan Code Smell & Kerapian
Sebelum menyelesaikan pekerjaan, lakukan *review* terhadap kode Anda:
1. Pastikan import yang tidak digunakan dihapus.
2. Tidak ada deklarasi variabel menggunakan `any`.
3. Pastikan kode yang baru ditulis mematuhi indentasi dan standar format (linting) yang berlaku pada repositori proyek.
4. Verifikasi bahwa logika untuk *blocker* (seperti `useBlocker`) ketika form *dirty* tetap berfungsi secara normal saat navigasi dipicu dari proses *submit* (biasanya dinonaktifkan via `isSubmittingSuccess.current = true`).

### Tahap 6: Verifikasi Hasil (Testing Manual)
Untuk memastikan UX bekerja dengan benar, UI/UX tester akan:
1. Masuk ke halaman Create Invoice (`/invoices/new`).
2. Mengisi form dengan data *dummy* yang valid.
3. Melakukan submit.
4. Memerhatikan apakah ada notifikasi "*Request created successfully!*".
5. Memastikan URL di-*redirect* otomatis ke halaman detail invoice tanpa *reload* halaman penuh (SPA behavior).
6. Memastikan tidak ada *error* merah di console browser terkait *routing* atau tipe data.
