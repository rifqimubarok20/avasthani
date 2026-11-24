# Checklist Implementasi — Avasthani

## Checkpoint 1 — Audit dan fondasi (SELESAI)
- [x] Baca PRD.md dan DESIGN.md
- [x] Inisialisasi project Expo SDK 58 (React Native 0.88, TypeScript)
- [x] Struktur direktori sesuai DESIGN.md (app/, src/, functions/, aturan Firebase)
- [x] TypeScript strict mode (`tsc --noEmit` lolos)
- [x] ESLint (`expo lint`) lolos
- [x] Nativewind + Tailwind CSS terkonfigurasi
- [x] Expo Router terkonfigurasi (`src/app/_layout.tsx`, `index.tsx`, `(auth)/`, `(app)/`)
- [x] Konfigurasi Firebase klien (`.env.example`, `app.config.ts`, `src/services/firebase/`)
- [x] Cloud Functions scaffold (`functions/src/index.ts`)
- [x] Firestore Rules (deny-by-default), Storage Rules, firestore.indexes.json
- [x] firebase.json (Emulator Suite)
- [x] Tipe data, tema, utilitas format (Rupiah/tanggal Indonesia)
- [x] Dokumentasi setup lokal (`SETUP.md`)
- [x] `.env` dan folder native (`ios/`, `android/`) tidak dikommit

## Checkpoint 2 — Autentikasi dan profil (implementasi selesai)
- [x] Onboarding 3 slide dan penyimpanan status onboarding
- [x] Registrasi, login, logout, reset password
- [x] Pemulihan sesi autentikasi
- [x] Profil pengguna dan bisnis
- [x] Role dan membership; pendaftaran mandiri hanya BUYER/SUPPLIER, role OPERATOR/SUPER_ADMIN tetap tepercaya/server-managed
- [x] Status verifikasi bisnis (PENDING/VERIFIED/REJECTED)
- [x] Guard navigasi berdasarkan autentikasi, status akun, membership, dan verifikasi
- [x] Tes skema form dan keputusan guard navigasi
- [x] Firestore Rules membatasi perubahan status, role, dan membership dari klien

## Checkpoint 3 — Katalog (implementasi selesai)
- [x] Kategori dan satuan
- [x] Daftar dan detail produk
- [x] Upload foto produk
- [x] Form produk supplier
- [x] Moderasi produk oleh operator
- [x] Stok dan harga ditampilkan sebagai indikatif; Security Rules dan indeks diterbitkan

## Checkpoint 4 — Permintaan dan sourcing (belum dimulai)
- [ ] Form permintaan pembelian buyer
- [ ] Daftar dan detail permintaan
- [ ] Antrean operator
- [ ] Respons pemasok

## Checkpoint 5 — Penawaran (belum dimulai)
- [ ] Penyusunan penawaran dan rincian harga
- [ ] Masa berlaku penawaran
- [ ] Penerimaan dan penolakan penawaran
- [ ] Validasi backend

## Checkpoint 6 — Pesanan (belum dimulai)
- [ ] Pembuatan order idempotent
- [ ] Snapshot kesepakatan
- [ ] Timeline status
- [ ] Bukti penerimaan dan laporan masalah

## Checkpoint 7 — Operasional (belum dimulai)
- [ ] Pencatatan biaya internal
- [ ] Perhitungan margin internal
- [ ] Audit log
- [ ] Push notification (FCM)
- [ ] Ringkasan operasional

## Checkpoint 8 — Hardening dan rilis uji (belum dimulai)
- [ ] Pengujian Security Rules (emulator)
- [ ] Unit dan integration tests
- [ ] TypeScript dan lint akhir
- [ ] Build aplikasi (development)
- [ ] Pemeriksaan performa dan aksesibilitas
- [ ] Dokumentasi deployment dan checklist rilis
