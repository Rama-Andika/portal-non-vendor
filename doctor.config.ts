import { defineConfig } from "react-doctor/api";

export default defineConfig({
  // Score API dimatikan. Payload-nya berisi seluruh daftar temuan termasuk path
  // file, ditambah metadata `repo` dan `sha` commit. Repo ini portal internal,
  // jadi struktur foldernya tidak dikirim keluar.
  //
  // CATATAN: opsi ini TIDAK mematikan telemetry. Telemetry dimatikan lewat flag
  // `--no-score` pada script npm (lihat package.json).
  noScore: true,

  // Socket.dev supply-chain check dimatikan. Dia melakukan satu request jaringan
  // per dependency langsung (repo ini punya sekitar 80 dependency langsung) dan
  // cakupannya hanya dependency langsung, bukan transitive. Keamanan dependency
  // ditangani Dependabot di GitHub, yang cakupannya lebih luas.
  supplyChain: { enabled: false },

  // Dua rule di bawah ini duplikat PERSIS dengan ESLint — file dan nomor baris
  // sama. Dimatikan supaya satu masalah tidak dilaporkan dua kali.
  // ESLint tetap satu-satunya otoritas untuk keduanya:
  //   - react-doctor/exhaustive-deps       -> react-hooks/exhaustive-deps
  //   - react-doctor/only-export-components -> react-refresh/only-export-components
  rules: {
    "react-doctor/exhaustive-deps": "off",
    "react-doctor/only-export-components": "off",
  },
});
