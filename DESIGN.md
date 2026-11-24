DESIGN --- Avasthani
Product & Technical Design Specification
Versi: 1.0
Tanggal: 29 Oktober 2026
Platform: React Native + Expo Development Build + Firebase

1. Tujuan Dokumen
Dokumen ini menerjemahkan PRD Avasthani menjadi pedoman desain UX/UI,
struktur aplikasi, arsitektur teknis, data Firestore, otorisasi, serta
pola implementasi. Fokusnya adalah MVP perdagangan hasil pertanian B2B
untuk wilayah awal Garut dan Tasikmalaya.

2. Prinsip Desain
Transaksi dulu: permintaan, penawaran, dan pesanan harus lebih
mudah ditemukan daripada fitur sekunder.
Jelas untuk pengguna nonteknis: gunakan Bahasa Indonesia
sehari-hari yang profesional, satuan eksplisit, dan status yang
mudah dipahami.
Operasional manusia tetap menjadi pusat MVP: operator Avasthani
mengonfirmasi stok dan menyusun penawaran; jangan mengasumsikan stok
realtime.
Transparansi bagi pihak yang bertransaksi: buyer melihat rincian
harga dan biaya yang relevan; margin internal hanya untuk role
berwenang.
Aman secara default: izin ditetapkan di server/Rules, bukan
hanya menyembunyikan tombol di UI.
Tahan koneksi tidak stabil: simpan draft bila memungkinkan,
tampilkan retry, dan jelaskan status sinkronisasi.
Ramah perangkat: desain mobile-first untuk Android kelas
menengah, tanpa animasi berat.
Bangun sesuai MVP: hindari microservices, AI wajib, wallet
investasi, atau abstraksi kompleks sebelum kebutuhan terbukti.
3. Informasi Arsitektur
3.1 Stack
React Native dengan Expo Development Build.
TypeScript dengan strict mode.
React Native Firebase native SDK.
Nativewind untuk styling utama.
Firebase Authentication.
Cloud Firestore.
Firebase Storage.
Cloud Functions for Firebase.
Firebase Cloud Messaging.
Firebase App Check.
Firebase Analytics dan Crashlytics.
React Navigation atau Expo Router; pilih satu pola routing dan
gunakan konsisten.
Validasi form menggunakan skema runtime (misalnya Zod) bila sesuai
dengan stack yang dipilih.
Catatan Expo: karena React Native Firebase menggunakan modul native,
gunakan Expo Development Build dan konfigurasi plugin native yang
sesuai. Jangan menjadikan Expo Go sebagai target runtime untuk build
yang membutuhkan modul native tersebut.

3.2 Arsitektur logis
┌───────────────────────────────────────────┐
│              Avasthani Mobile             │
│ React Native + TypeScript + Nativewind    │
│ Screens / Components / State / Validation│
└─────────────────────┬─────────────────────┘
                      │ Firebase SDK
       ┌──────────────┼────────────────┐
       │              │                │
       ▼              ▼                ▼
 Firebase Auth   Firestore         Firebase Storage
       │              │                │
       └──────────────┼────────────────┘
                      │
                      ▼
             Cloud Functions
     Validasi bisnis / status / margin /
       notifikasi / operasi sensitif
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
         FCM              Audit & Analytics
Klien membaca/menulis data yang secara eksplisit diizinkan oleh Security
Rules. Semua perubahan kritis---misalnya menerima penawaran, membuat
pesanan, mengubah status, menetapkan role, dan menghitung margin---harus
melalui Cloud Functions yang memvalidasi identitas, hak akses, transisi
status, dan konsistensi data.

4. Struktur Navigasi
4.1 Navigasi pengguna
Gunakan navigasi yang disesuaikan dengan role, tetapi tetap mendukung
akun yang memiliki lebih dari satu role.

Buyer - Beranda - Katalog - Permintaan - Pesanan - Akun

Supplier/Petani - Beranda - Produk Saya - Permintaan Pasokan /
Penawaran Pemasok - Pesanan - Akun

Admin/Operator Admin operasional sebaiknya menggunakan web dashboard
terpisah bila lingkup kerja membutuhkan tabel lebar dan pemrosesan
banyak pesanan. Jika admin mobile dibutuhkan pada MVP, batasi pada tugas
operasional ringan. Jangan menempatkan kredensial Admin SDK di aplikasi
mobile.

4.2 Rute contoh
/auth/login
/auth/register
/auth/forgot-password
/onboarding/profile
/home
/catalog
/catalog/:productId
/requests
/requests/create
/requests/:requestId
/quotes/:quoteId
/orders
/orders/:orderId
/supplier/products
/supplier/products/create
/supplier/products/:productId/edit
/account
/account/business
/account/notifications
Rute admin sebaiknya berada pada aplikasi web terpisah atau area admin
yang dilindungi secara ketat. Keberadaan rute tersembunyi bukan kontrol
keamanan.

5. Alur UX Utama
5.1 Buyer membuat permintaan
Beranda → tombol utama "Buat Permintaan".
Pilih produk atau isi nama produk jika belum ada di katalog.
Isi jumlah dan satuan, kualitas/grade, lokasi, tanggal dibutuhkan,
serta catatan.
Tampilkan ringkasan sebelum submit.
Setelah submit, tampilkan nomor permintaan dan status "Sedang
ditinjau".
Saat penawaran tersedia, kirim push notification dan tampilkan
rincian harga, biaya, total, masa berlaku, dan syarat.
Buyer menerima atau menolak penawaran dengan dialog konfirmasi.
Jika diterima, tampilkan halaman detail pesanan dan timeline status.
5.2 Supplier merespons kebutuhan
Supplier membuka permintaan pasokan yang ditugaskan operator.
Meninjau jumlah, kualitas, lokasi, dan tanggal dibutuhkan.
Mengisi jumlah yang sanggup disediakan, harga per satuan, periode
ketersediaan, dan catatan.
Mengirim respons.
Operator mengonfirmasi dan menggunakan respons untuk menyusun
penawaran ke buyer.
Supplier melihat status konfirmasi dan pesanan terkait.
5.3 Operator mengelola transaksi
Melihat antrean permintaan baru.
Memfilter menurut produk, wilayah, tanggal, dan status.
Menghubungi pemasok dan mencatat respons harga.
Membandingkan pemasok, ketersediaan, kualitas, serta estimasi biaya.
Menyusun penawaran final kepada buyer.
Memantau status pemenuhan, mencatat biaya, dan menyelesaikan
komplain.
Menutup pesanan dan memastikan data biaya lengkap.
6. Wireframe Konseptual
Beranda Buyer
┌────────────────────────────────┐
│ Halo, [Nama Usaha]       [🔔]  │
│ Cari hasil pertanian...        │
├────────────────────────────────┤
│ [ + Buat Permintaan ]          │
├────────────────────────────────┤
│ Permintaan Aktif               │
│ Cabai Merah  • 100 kg          │
│ Status: Sedang dicarikan       │
│ [Lihat Detail]                 │
├────────────────────────────────┤
│ Kategori                       │
│ [Sayur] [Buah] [Rempah] [Lain] │
├────────────────────────────────┤
│ Produk Tersedia                │
│ [Foto] Cabai Merah             │
│        Stok perlu konfirmasi   │
│ [Lihat Produk]                 │
├────────────────────────────────┤
│ Beranda  Katalog  Permintaan   │
│ Pesanan  Akun                  │
└────────────────────────────────┘
Detail Penawaran
┌────────────────────────────────┐
│ ← Detail Penawaran             │
│ Cabai Merah                    │
│ 100 kg                         │
├────────────────────────────────┤
│ Harga satuan        Rp70.000   │
│ Biaya pengiriman    Rp...      │
│ Biaya lain          Rp...      │
│ Total               Rp...      │
│ Berlaku sampai      [tanggal]  │
├────────────────────────────────┤
│ Spesifikasi / grade            │
│ Jadwal dan lokasi pengiriman   │
│ Syarat pembatalan              │
├────────────────────────────────┤
│ [Tolak]       [Terima]         │
└────────────────────────────────┘
Detail Pesanan
┌────────────────────────────────┐
│ ← Pesanan #AV-XXXX             │
│ Status: Dalam Persiapan        │
├────────────────────────────────┤
│ Produk / jumlah / harga        │
│ Lokasi dan jadwal              │
├────────────────────────────────┤
│ Timeline                       │
│ ✓ Pesanan dikonfirmasi         │
│ ✓ Pemasok dikonfirmasi         │
│ ● Dalam persiapan              │
│ ○ Dalam pengiriman             │
│ ○ Diterima                     │
├────────────────────────────────┤
│ [Hubungi Operasional]          │
│ [Laporkan Masalah]             │
└────────────────────────────────┘
Wireframe ini adalah struktur informasi, bukan spesifikasi
pixel-perfect.

7. Sistem Visual
7.1 Arah visual
Kesan: agritech modern, terpercaya, bersih, dekat dengan pelaku
usaha pertanian.
Gunakan ruang putih yang cukup dan kartu sederhana.
Foto produk membantu identifikasi, tetapi informasi jumlah, satuan,
kualitas, harga, dan status tetap menjadi fokus.
Hindari visual yang terlalu ramai, gradien berat, atau dekorasi yang
mengganggu transaksi.
7.2 Token warna awal
Palet berikut adalah usulan awal dan harus diuji untuk kontras serta
konsistensi merek.

Token Nilai Penggunaan

primary #216E4E Tombol utama, navigasi aktif
primaryDark #164B36 Teks/elemen primer gelap
primarySoft #E8F4EC Latar highlight ringan
accent #E9A23B Aksen penting, bukan status utama
background #F7F8F5 Latar layar
surface #FFFFFF Kartu dan form
textPrimary #202923 Teks utama
textSecondary #66736A Teks sekunder
border #DCE4DD Border/divider
danger #B42318 Kesalahan atau tindakan berbahaya
success #18794E Status berhasil
warning #9A6700 Peringatan

Jangan mengandalkan warna saja untuk status. Sertakan label teks dan
ikon bila membantu.

7.3 Tipografi dan ukuran
Gunakan font sistem untuk performa dan keterbacaan; font brand dapat
ditambahkan jika tersedia lisensi dan asetnya.
Ukuran acuan: judul layar 22--26, judul bagian 16--18, isi 14--16,
label bantu 12--14.
Radius kartu 12--16 dp; tombol/form sekitar 10--12 dp.
Tinggi target sentuh ideal sekitar 44--48 dp.
Spacing berbasis kelipatan 4 atau 8 dp.
7.4 Komponen reusable
AppHeader
SearchField
PrimaryButton, SecondaryButton, DestructiveButton
StatusBadge
ProductCard
ProductImage
QuantityUnitInput
PriceBreakdown
RequestCard
QuoteSummaryCard
OrderTimeline
EmptyState
ErrorState dengan tombol retry
LoadingSkeleton
FormField dengan label, bantuan, dan error
ConfirmActionSheet / dialog konfirmasi
8. Pola Status UI
Gunakan label yang dipahami pengguna: - SUBMITTED: "Terkirim" -
IN_REVIEW: "Sedang ditinjau" - SOURCING: "Sedang dicarikan
pemasok" - OFFERED: "Penawaran tersedia" - CONFIRMED: "Pesanan
dikonfirmasi" - PREPARING: "Dalam persiapan" - IN_DELIVERY: "Dalam
pengiriman" - DELIVERED: "Sudah diterima" - COMPLETED: "Selesai" -
DISPUTED: "Ada masalah" - CANCELLED: "Dibatalkan" - EXPIRED:
"Kedaluwarsa"

Status internal dan label UI dipisahkan melalui mapping agar copy dapat
berubah tanpa mengubah data backend.

9. Struktur Direktori Aplikasi
Contoh struktur yang dapat dikembangkan secara bertahap:

avasthani-app/
├── app/                         # Jika menggunakan Expo Router
│   ├── (auth)/
│   ├── (buyer)/
│   ├── (supplier)/
│   └── _layout.tsx
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── products/
│   │   ├── requests/
│   │   ├── quotes/
│   │   └── orders/
│   ├── features/
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── catalog/
│   │   ├── purchase-requests/
│   │   ├── supplier-responses/
│   │   ├── quotes/
│   │   ├── orders/
│   │   └── notifications/
│   ├── services/
│   │   ├── firebase/
│   │   ├── callable-functions/
│   │   └── storage/
│   ├── hooks/
│   ├── navigation/
│   ├── schemas/
│   ├── theme/
│   ├── types/
│   ├── utils/
│   └── constants/
├── functions/                   # Cloud Functions TypeScript
│   └── src/
│       ├── auth/
│       ├── purchase-requests/
│       ├── quotes/
│       ├── orders/
│       ├── notifications/
│       ├── audit/
│       └── index.ts
├── assets/
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
├── app.config.ts
├── package.json
└── tsconfig.json
Jangan membuat semua modul sekaligus. Struktur folder dapat dimulai
lebih kecil dan dipecah ketika domain benar-benar tumbuh.

10. Model Data Firestore
10.1 Prinsip umum
Gunakan satu database Firestore utama untuk MVP.
Pisahkan akses berdasarkan kepemilikan, membership bisnis, dan role.
Gunakan ID dokumen acak; jangan memakai nomor telepon/email sebagai
document ID.
Simpan createdAt, updatedAt, createdBy, dan status pada
entitas operasional.
Gunakan subkoleksi events untuk timeline yang tumbuh seiring
waktu.
Simpan snapshot harga/syarat di dokumen order supaya perubahan
katalog tidak mengubah transaksi historis.
Gunakan field referensi berupa ID string untuk relasi lintas
koleksi; Firestore bukan relational database dan tidak melakukan
join otomatis.
Hindari duplikasi berlebihan, tetapi terima denormalisasi terbatas
untuk layar yang membutuhkan ringkasan cepat.
Buat indeks hanya sesuai query yang digunakan dan deploy bersama
konfigurasi.
10.2 users/{uid}
type UserProfile = {
  uid: string;
  displayName: string;
  phoneNumber?: string;
  email?: string;
  photoURL?: string;
  status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED";
  businessIds: string[];
  preferredRole?: "BUYER" | "SUPPLIER";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
Role berhak istimewa tidak boleh dapat diubah langsung oleh klien.
Gunakan custom claims yang ditetapkan server atau dokumen membership
tepercaya yang divalidasi melalui backend/Rules.

10.3 businesses/{businessId}
type Business = {
  id: string;
  name: string;
  type: "BUYER" | "SUPPLIER" | "MIXED";
  ownerUid: string;
  memberUids: string[];
  phone?: string;
  address: {
    province: string;
    city: string;
    district?: string;
    village?: string;
    addressLine?: string;
    latitude?: number;
    longitude?: number;
  };
  verificationStatus: "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
Untuk skala lebih besar, pindahkan membership ke koleksi terpisah agar
daftar anggota tidak tumbuh tanpa batas.

10.4 products/{productId}
type Product = {
  id: string;
  supplierBusinessId: string;
  name: string;
  categoryId: string;
  description?: string;
  images: string[];
  baseUnit: string; // contoh: kg, ikat, karung
  grade?: string;
  indicativeStock?: number;
  indicativePricePerUnit?: number;
  availabilityStatus: "AVAILABLE" | "LIMITED" | "UNAVAILABLE";
  reviewStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  location: { city: string; district?: string };
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
Harga dan stok indikatif tidak menjadi komitmen final tanpa konfirmasi
pemasok.

10.5 purchaseRequests/{requestId}
type PurchaseRequest = {
  id: string;
  buyerBusinessId: string;
  createdBy: string;
  productId?: string;
  productNameSnapshot: string;
  quantity: number;
  unit: string;
  gradeOrSpecification?: string;
  targetPricePerUnit?: number;
  deliveryLocation: {
    city: string;
    district?: string;
    addressLine?: string;
  };
  neededBy: Timestamp;
  notes?: string;
  status:
    | "SUBMITTED" | "IN_REVIEW" | "SOURCING" | "OFFERED"
    | "CONVERTED" | "REJECTED" | "CANCELLED" | "EXPIRED";
  assignedOperatorUid?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
10.6 supplierOffers/{supplierOfferId}
type SupplierOffer = {
  id: string;
  requestId: string;
  supplierBusinessId: string;
  quantityAvailable: number;
  unit: string;
  supplierPricePerUnit: number;
  gradeOrSpecification?: string;
  availableUntil?: Timestamp;
  estimatedReadyAt?: Timestamp;
  notes?: string;
  status: "DRAFT" | "SUBMITTED" | "SELECTED" | "REJECTED" | "WITHDRAWN";
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
10.7 buyerQuotes/{quoteId}
type BuyerQuote = {
  id: string;
  requestId: string;
  buyerBusinessId: string;
  createdByOperatorUid: string;
  items: Array<{
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    gradeOrSpecification?: string;
  }>;
  deliveryFee: number;
  otherFees: number;
  discount: number;
  totalAmount: number;
  currency: "IDR";
  terms: string;
  validUntil: Timestamp;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "WITHDRAWN";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
Harga total harus dihitung ulang dan divalidasi di backend; jangan
mempercayai nilai totalAmount dari klien.

10.8 orders/{orderId}
type Order = {
  id: string;
  orderNumber: string;
  requestId: string;
  quoteId: string;
  buyerBusinessId: string;
  supplierBusinessIds: string[];
  status: string;
  currency: "IDR";
  itemsSnapshot: Array<{
    productName: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    lineTotal: number;
    gradeOrSpecification?: string;
  }>;
  deliverySnapshot: {
    fee: number;
    address: string;
    scheduledAt?: Timestamp;
  };
  subtotal: number;
  otherFees: number;
  discount: number;
  totalAmount: number;
  acceptedAt: Timestamp;
  completedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
Order creation harus idempotent: quote yang sama tidak boleh membuat dua
order hanya karena pengguna menekan tombol dua kali atau retry jaringan.

10.9 Biaya internal dan audit
orderCosts/{costId}: - orderId - costType (supplier, logistics,
sorting, shrinkage, payment, other) - amount - currency - notes -
createdBy - createdAt

auditLogs/{logId}: - actorUid - action - entityType -
entityId - before/`after` terbatas pada field yang diperlukan -
createdAt - requestId atau correlation ID bila tersedia

Audit log tidak boleh menyimpan password, token, rahasia, atau data
pribadi berlebihan.

11. Akses dan Security Rules
11.1 Matriks akses ringkas
Data Buyer Supplier Operator/Admin Super Admin

Profil sendiri Baca/tulis Baca/tulis terbatas Sesuai tugas Ya
terbatas

Produk yang Baca Baca Kelola Kelola
disetujui

Produk sendiri --- Baca/tulis terbatas Tinjau Kelola

Permintaan Baca/buat Hanya jika Kelola Kelola
sendiri ditugaskan/diizinkan

Penawaran --- Baca/tulis milik Kelola sesuai Kelola
supplier sendiri tugas

Penawaran Baca milik Tidak Buat/kelola Kelola
buyer bisnis

Pesanan Pesanan bisnis Pesanan terkait saja Kelola sesuai Kelola
sendiri tugas

Biaya/margin Tidak Tidak Role tertentu Ya
internal

Audit log Tidak Tidak Terbatas Ya
Matriks ini adalah maksud produk, bukan pengganti pengujian Security
Rules. Untuk akses operator, definisikan izin spesifik dan jangan
memberi akses global kepada semua admin tanpa kebutuhan.

11.2 Contoh aturan desain
Mulai dari allow read, write: if false lalu buka izin per koleksi.
Validasi bahwa pengguna terautentikasi dan memiliki hubungan dengan
bisnis yang diminta.
Validasi field yang boleh berubah; klien tidak boleh mengubah
ownerUid, status verifikasi, role, margin, atau audit log.
Semua operasi sensitif dipindahkan ke callable/HTTP Cloud Functions.
Terapkan Firebase App Check dan uji Rules menggunakan Firebase
Emulator Suite.
Ingat bahwa Admin SDK pada Cloud Functions melewati Security Rules;
fungsi wajib melakukan otorisasi sendiri.
Jangan salin contoh Security Rules generik ke production tanpa
mengujinya dengan skenario positif dan negatif.

12. Cloud Functions yang Disarankan
Contoh endpoint/callable functions: - submitPurchaseRequest -
submitSupplierOffer - createBuyerQuote - respondToBuyerQuote -
createOrderFromAcceptedQuote - transitionOrderStatus -
recordOrderCost - verifyBusiness - sendOrderNotification -
reportOrderIssue

Setiap fungsi harus: 1. Memastikan identitas pengguna. 2. Memastikan
role/membership dan akses ke resource. 3. Memvalidasi payload. 4.
Memvalidasi transisi status. 5. Menggunakan operasi transaksional atau
idempotency key jika dibutuhkan. 6. Menulis perubahan dan audit log. 7.
Mengirim notifikasi setelah operasi utama berhasil, dengan mekanisme
yang aman terhadap retry. 8. Mengembalikan error code yang stabil dan
tidak membocorkan detail internal.

13. Storage dan Notifikasi
Storage
Contoh path:

product-images/{supplierBusinessId}/{productId}/{fileId}
business-documents/{businessId}/{fileId}
order-evidence/{orderId}/{fileId}
Terapkan batas tipe MIME, ukuran, pemilik, dan izin baca/tulis. Dokumen
bisnis harus lebih ketat daripada foto katalog. Jangan membuat semua
file dapat dibaca publik tanpa pertimbangan.

Push notification
Kirim untuk: - Penawaran baru tersedia bagi buyer. - Buyer
menerima/menolak penawaran. - Pemasok dikonfirmasi. - Status pesanan
berubah. - Permintaan informasi tambahan. - Laporan masalah diperbarui.

Notifikasi hanya petunjuk; saat dibuka, aplikasi harus membaca status
terbaru dari server. Jangan memasukkan rincian sensitif ke payload push.

14. State, Loading, dan Error Handling
Setiap layar data harus memiliki: - Loading state/skeleton. - Empty
state dengan langkah berikutnya yang jelas. - Error state dengan pesan
singkat dan tombol coba lagi. - Success feedback setelah aksi selesai. -
Disabled state saat submit berlangsung untuk mencegah duplikasi. -
Konfirmasi sebelum tindakan yang sulit dibatalkan. - Validasi jumlah
lebih besar dari nol, satuan terpilih, harga nonnegatif, dan tanggal
yang masuk akal.

Jangan menampilkan status sukses sebelum server mengonfirmasi operasi.

15. Offline dan Sinkronisasi
Gunakan kemampuan cache/offline Firestore secara hati-hati dan
jelaskan bahwa perubahan mungkin belum tersinkron.
Jangan mengizinkan keputusan transaksi kritis secara offline,
termasuk menerima penawaran, mengubah status order, atau menghitung
margin.
Tampilkan indikator "Menunggu koneksi" bila operasi belum
dikonfirmasi server.
Saat koneksi kembali, hindari mengirim ulang transaksi tanpa
idempotency.
Draft permintaan dapat disimpan lokal jika implementasi mendukung
penyimpanan aman dan penanganan konflik yang jelas.
16. Testing Strategy
Unit test
Validasi form dan normalisasi satuan.
Pemetaan status ke label.
Kalkulasi harga di sisi tampilan (server tetap menjadi sumber
kebenaran).
Validasi transisi status di modul backend.
Integration test
Callable Functions untuk penawaran dan pembuatan order.
Pembuatan order idempotent.
Penulisan audit log dan notifikasi.
Upload file dan pembatasan tipe/ukuran.
Security test
Buyer A tidak dapat membaca permintaan atau order Buyer B.
Supplier A tidak dapat mengubah produk Supplier B.
Supplier tidak dapat membaca biaya dan margin internal.
Buyer tidak dapat mengubah harga final, role, status verifikasi,
atau status order secara langsung.
Pengguna anonim tidak dapat membaca data privat.
Pengguna yang disuspensi tidak dapat menjalankan operasi bisnis.
Pengujian dilakukan melalui Firebase Emulator Suite sebelum deploy.
UX test
Uji alur permintaan dengan buyer yang belum terbiasa menggunakan
aplikasi.
Uji input jumlah dan satuan pada layar kecil.
Uji koneksi lambat, upload gagal, sesi kedaluwarsa, dan notifikasi
yang dibuka setelah status berubah.
17. Observability dan Biaya
Aktifkan Crashlytics untuk crash dan error yang relevan.
Gunakan Analytics untuk event produk secara agregat dan minimisasi
data.
Pasang budget alerts pada Google Cloud/Firebase.
Gunakan pagination dan query terindeks; jangan membaca seluruh
koleksi untuk menghitung ringkasan.
Hindari listener realtime pada layar yang tidak sedang aktif.
Evaluasi biaya per pengguna aktif, per permintaan, dan per order.
Jangan menaruh API key rahasia atau service account key di bundle
aplikasi; Firebase client config bukan pengganti Security Rules.
18. Rencana Implementasi
Fondasi: buat Firebase projects terpisah untuk development dan
production, TypeScript, Expo Development Build, Nativewind,
lint/test, Emulator Suite.
Auth & profil: login, registrasi, profil bisnis, membership,
verifikasi.
Katalog: kategori, produk, foto, moderasi, stok indikatif.
Permintaan: form buyer, daftar/detail permintaan, notifikasi
operator.
Sourcing & penawaran: respons supplier, penyusunan quote,
validasi harga di server.
Pesanan: konversi quote, timeline status, bukti penerimaan,
idempotency.
Biaya & audit: pencatatan biaya, margin internal, audit log dan
izin.
Hardening: Rules tests, App Check, Crashlytics, budget alerts,
uji lapangan terbatas.
19. Keputusan yang Harus Dijaga
MVP adalah marketplace/perantara jual-beli hasil pertanian, bukan
trading finansial.
Mulai dari satu database Firestore utama; database terpisah per role
bukan kebutuhan awal.
Gunakan React Native + Expo Development Build + TypeScript dan React
Native Firebase.
Gunakan Cloud Functions untuk logika bisnis tepercaya.
Harga/stok katalog bersifat indikatif sampai dikonfirmasi.
Margin dan biaya internal tidak boleh bocor ke buyer/supplier.
Fitur investor/funding ditunda sampai struktur legal, kepatuhan, dan
tata kelola dana dipastikan.
Fokus wilayah awal Garut/Tasikmalaya dan validasi transaksi B2B
sebelum ekspansi.
Dokumen ini harus diselaraskan dengan PRD.md. Sebelum rilis produksi,
lengkapi keputusan yang masih terbuka, lakukan tinjauan keamanan, dan
validasi aturan operasional dengan tim lapangan.



⋮⋮⋮⋮