# Temuan React Doctor yang Sudah Ditolak

File ini adalah memori jangka panjang untuk hasil audit React Doctor.

Fungsinya: setiap temuan yang sudah diperiksa manusia dan **terbukti bukan masalah** dicatat di
sini, supaya audit berikutnya tidak mengangkat temuan yang sama lagi. Tanpa file ini, setiap audit
akan menyajikan daftar temuan yang sama berulang-ulang.

Agent `react-audit` **wajib membaca file ini sebelum menilai temuan**, dan wajib menandai temuan
yang cocok dengan entri di sini sebagai `Rejected` tanpa membahasnya lagi di laporan utama.

## Cara menambah entri

Satu entri untuk satu alasan penolakan. Format setiap entri:

### `<nama-rule>` — `<path/file.tsx>` baris `<nomor>`

- **Tanggal**: `YYYY-MM-DD`
- **Alasan**: satu atau dua kalimat yang menjelaskan mengapa temuan ini bukan masalah.
- **Predikat**: kondisi yang bisa diperiksa ulang oleh agent. Penolakan ini hanya sah selama
  predikat ini masih benar. Contoh: "props `status` memang hanya dipakai sebagai nilai awal".
- **Siapa yang memutuskan**: nama orang.

Kalau predikat tidak lagi benar karena kodenya berubah, **hapus entri ini** supaya temuannya
muncul lagi di audit berikutnya.

## Entri

Belum ada entri.

Pada baseline scan pertama (React Doctor 0.9.14, 148 warning, 0 error), tidak ada satu pun temuan
yang terbukti false positive. Sembilan temuan yang duplikat dengan ESLint ditangani dengan cara
lain, yaitu mematikan rule-nya di `doctor.config.ts`, bukan dicatat di sini.
