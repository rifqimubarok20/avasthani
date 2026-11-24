# Avasthani — Dokumentasi Setup Lokal (Checkpoint 1)

Dokumen ini menguraikan langkah-langkah yang harus dilakukan developer untuk
menjalankan Avasthani secara lokal. Sesuai PRD.md dan DESIGN.md, aplikasi
menggunakan Expo Development Build (bukan Expo Go) karena React Native Firebase
memerlukan modul native.

## 1. Prasyarat

- Node.js (disarankan v20 atau v22; repo diuji dengan Node v22.22.3)
- npm (disertakan dengan Node)
- Firebase CLI (opsional, untuk emulator & deploy Functions):
  `npm install -g firebase-tools`
- Akun Firebase Console untuk membuat project dan menyiapkan aplikasi Android/iOS

## 2. Clone dan install dependensi

```bash
cd avasthani-app
npm install
```

## 3. Konfigurasi Firebase (klien)

1. Buat project Firebase di [Firebase Console](https://console.firebase.google.com)
   (pisahkan project development dan production).
2. Di Project Settings -> Your apps, daftarkan aplikasi Android
   (package `com.avasthani.app`) dan/atau iOS
   (bundle `com.avasthani.app`).
3. Unduh file konfigurasi:
   - Android: `google-services.json` → letakkan di `android/` (hasil Continuous Native
     Generation; tidak ada di repo sebelum build native).
   - iOS: `GoogleService-Info.plist` → letakkan di `ios/`.
4. Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

5. Isi nilai di `.env` dari konfigurasi aplikasi Firebase Console
   (`EXPO_PUBLIC_FIREBASE_API_KEY`, `PROJECT_ID`, `APP_ID`, dst.).
   File `.env` **tidak boleh dikommit** ke repository (sudah di `.gitinfo`).

## 4. Aktifkan layanan Firebase

Di Firebase Console, aktifkan (minimal untuk development):

- Authentication: Email/Password
- Cloud Firestore: buat database (mode test untuk development, aturan production
  di `firestore.rules`)
- Firebase Storage
- Cloud Functions
- Cloud Messaging (FCM)
- App Check
- Google Analytics
- Crashlytics

## 5. Firebase Emulator Suite (pengujian lokal)

File `firebase.json`, `firestore.rules`, `storage.rules`,
dan `firestore.indexes.json` sudah tersedia di root.

```bash
# Login ke Firebase (saat ingin menggunakan emulator/deploy)
firebase login

# Jalankan emulator (Auth, Firestore, Storage, Functions)
firebase emulators:start
```

Emulator UI tersedia di `http://localhost:4000`.
Firestore berjalan di port `8080`, Functions di `5001`.

Catatan: aplikasi mobile harus dikonfigurasi untuk menunjuk ke emulator
(Firestore `connectFirestoreEmulator`, Functions `connectFunctionsEmulator`, dst.)
saat berjalan di development. Koneksi ke emulator akan diimplementasikan
bertahap per fitur.

## 6. Jalankan aplikasi (development build)

React Native Firebase menggunakan modul native, jadi **tidak dapat dijalankan
dengan Expo Go**. Gunakan development build:

```bash
# Memulai dev server (memerlukan development build untuk modul native)
npx expo start

# Atau build development build melalui EAS (memerlukan akun Expo)
npx eas-cli@latest build --profile development
```

Untuk iOS membutuhkan Xcode; untuk Android membutuhkan Android Studio atau
EAS Build di cloud.

## 7. Pemeriksaan kode

```bash
# TypeScript strict mode
npm run typecheck

# Lint (Expo / ESLint)
npm run lint

# Diagnosa Expo (perlu jaringan untuk beberapa pemeriksaan)
npm run doctor
```

## 8. Cloud Functions

```bash
# Build TypeScript functions
npm run functions:build

# Jalankan functions emulator
npm run functions:serve
```

### Rekomendasi pupuk AI (Groq)

Fitur "Dapatkan Rekomendasi AI" pada kalkulator pemupukan memanggil callable
function `getFertilizerRecommendation` (region `asia-southeast2`). API key
provider AI hanya disimpan di server, tidak pernah masuk ke bundle aplikasi.

```bash
# 1. Ambil API key gratis di https://console.groq.com/keys
# 2. Simpan sebagai secret Cloud Functions
firebase functions:secrets:set GROQ_API_KEY

# 3. Deploy fungsi
npm run functions:build
firebase deploy --only functions:getFertilizerRecommendation
```

Catatan:

- Cloud Functions memakai secret, sehingga project Firebase perlu paket **Blaze**
  (masih dalam kuota gratis, tetapi penagihan harus aktif).
- Batas pemakaian: 20 rekomendasi per pengguna per hari (koleksi `aiUsage`).
  Ubah `DAILY_LIMIT` di `functions/src/ai/recommend.ts` bila perlu.
- Model default `openai/gpt-oss-120b` (Groq Free plan: 1.000 permintaan/hari).
  Ganti `MODEL` di file yang sama untuk memakai model lain.
- Region fungsi harus sama dengan `EXPO_PUBLIC_FUNCTIONS_REGION` di `.env`.

## 9. Konfigurasi yang masih diperlukan (manual)

- Mengisi `.env` dengan kredensial Firebase project development (tidak ada
  kredensial produksi di repository).
- Menempatkan `google-services.json` / `GoogleService-Info.plist` pada
  direktori native sebelum build development.
- Mengatur Firebase App Check provider (DeviceCheck / Play Integrity) di
  Firebase Console.
- Mengonfigurasi budget alert di Google Cloud/Firebase (PRD section 11.2).

### Google Sign-In

- Aktifkan penyedia **Google** di Firebase Console → Authentication → Sign-in method.
- Daftarkan SHA-1 debug/release dan package `com.avasthani.app` pada Firebase
  Android app, lalu unduh ulang `google-services.json` agar memuat OAuth client.
- Isi `EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID` dengan Web OAuth client ID
  (`client_type: 3`). Jika konfigurasi native sudah memuat Web client ID,
  aplikasi juga dapat membacanya melalui `autoDetect`.
- Untuk iOS, unduh `GoogleService-Info.plist`, isi
  `GOOGLE_SERVICES_IOS_FILE=GoogleService-Info.plist`, dan bangun ulang aplikasi.
- Google Sign-In memakai kode native dan memerlukan development build; Expo Go
  tidak mendukungnya. Setelah menambah paket atau mengubah plugin, jalankan
  `npx expo run:android` atau `npx expo run:ios` untuk membuat ulang build.

- Pemilih foto produk (`expo-image-picker`) juga memakai modul native. Setelah
  pembaruan dependency/config Checkpoint 3, buat ulang development build Android/iOS.
- Admin dapat membuka **Moderasi produk** lalu memilih **Siapkan kategori & satuan
  awal** sekali. Sesudah itu pemasok terverifikasi dapat mengajukan produk.

## 10. Catatan arsitektur (Checkpoint 1)

- Routing: Expo Router, route berada di `src/app/`.
- Styling: Nativewind + Tailwind CSS (token di `tailwind.config.js` dan
  `src/theme/tokens.ts`).
- Firebase: `src/services/firebase/` (hanya klien SDK; Admin SDK **tidak**
  ada di aplikasi mobile).
- Cloud Functions: `functions/src/` (TypeScript).
- Aturan keamanan: `firestore.rules` (deny-by-default), `storage.rules`.
- Tipe data: `src/types/index.ts`.
- Utilitas format Rupiah/tanggal Indonesia: `src/utils/format.ts`.
