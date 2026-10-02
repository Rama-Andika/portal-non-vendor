---
description: Jalankan audit React Doctor read-only, lalu tulis laporannya ke .react-doctor/
argument-hint: "[full | changed] (opsional, default: file yang belum di-commit)"
---

Gunakan subagent `react-audit` untuk menjalankan audit React Doctor pada repo ini.

Cakupan yang diminta user: $ARGUMENTS

Kalau bagian cakupan di atas kosong, pakai cakupan default milik agent, yaitu hanya file yang
belum di-commit.

Aturan:

- Subagent itu read-only. Jangan memperbaiki temuan apa pun pada turn ini.
- Setelah subagent selesai, sampaikan ringkasannya ke user beserta path file laporan.
- Tanyakan ke user temuan mana yang ingin dikerjakan lebih dulu. Jangan langsung memperbaiki
  tanpa diminta.
