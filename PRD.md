PRD --- Avasthani
Product Requirements Document
Versi: 1.0
Tanggal: 29 Oktober 2026
Platform: Android dan iOS
Status: Draft untuk validasi dan implementasi MVP

1. Ringkasan Produk
Avasthani adalah platform perdagangan hasil pertanian yang menghubungkan
petani dengan pembeli B2B seperti pedagang, distributor, restoran,
katering, dan pelaku usaha pangan. Pada tahap awal, Avasthani beroperasi
sebagai perantara pengadaan (procurement intermediary): pembeli
menyampaikan kebutuhan, tim Avasthani mencocokkan permintaan dengan
petani/pemasok, lalu mengelola penawaran, pesanan, dan koordinasi
pemenuhan.

Contoh: pembeli membutuhkan 100 kg cabai dengan target harga
Rp70.000/kg. Avasthani mencari pemasok yang dapat memenuhi kebutuhan,
misalnya dengan harga pemasok Rp60.000/kg. Selisih harga dapat menjadi
margin kotor Avasthani, setelah memperhitungkan logistik, penyortiran,
susut, biaya pembayaran, dan biaya operasional. Harga, biaya, dan margin
harus transparan secara internal dan dikonfirmasi sebelum transaksi.

MVP berfokus pada transaksi B2B yang dapat dijalankan secara operasional
di wilayah Garut dan Tasikmalaya, bukan marketplace terbuka berskala
nasional. Model pendapatan utama adalah margin transaksi; pendapatan
SaaS untuk pencatatan usaha petani/pemasok dapat menjadi fase berikutnya
setelah kebutuhan inti tervalidasi.

Batasan penting: Avasthani bukan aplikasi trading finansial atau
order-book. Fitur investor tidak boleh menerima, menampung, menjanjikan,
atau mengelola dana investasi publik pada MVP. Jika fitur
pendanaan/investor akan diluncurkan, diperlukan kajian hukum, kepatuhan,
pengamanan dana, perjanjian, dan model operasional terpisah terlebih
dahulu.

2. Masalah yang Ingin Diselesaikan
Pembeli B2B kesulitan mendapatkan pasokan yang konsisten, sesuai
kuantitas, kualitas, waktu, dan harga.
Petani/pemasok membutuhkan akses ke permintaan yang jelas dan
pembeli yang dapat diandalkan.
Negosiasi melalui chat/telepon sulit ditelusuri; harga, jumlah,
status, dan komitmen dapat berbeda antar pihak.
Tim perantara membutuhkan satu tempat untuk mengelola permintaan,
pencarian pemasok, penawaran, pesanan, dan status pemenuhan.
Data transaksi perlu menjadi dasar untuk mengetahui margin, performa
pemasok, permintaan produk, dan tingkat pemenuhan.
3. Tujuan dan Metrik Keberhasilan
3.1 Tujuan MVP
Mencatat permintaan pembelian B2B secara terstruktur.
Memudahkan admin/operasional menemukan dan menghubungi pemasok yang
sesuai.
Mencatat penawaran harga dan konfirmasi pesanan.
Memantau status pesanan dari permintaan hingga selesai.
Menyediakan jejak audit untuk perubahan penting.
Memvalidasi kesediaan pembeli membayar dan kemampuan Avasthani
memperoleh margin transaksi.
3.2 Metrik awal
Jumlah pembeli B2B aktif per minggu.
Jumlah permintaan pembelian yang masuk.
Persentase permintaan yang mendapat penawaran.
Persentase penawaran yang dikonversi menjadi pesanan.
Persentase pesanan terpenuhi penuh dan tepat waktu.
Nilai transaksi bruto (GMV) dan margin kotor per pesanan.
Tingkat pembelian ulang dalam 30 hari.
Waktu median dari permintaan masuk sampai penawaran dikirim.
Jumlah sengketa, pembatalan, dan pengembalian per 100 pesanan.
Target angka ditetapkan setelah baseline dari uji coba operasional
pertama; jangan mengarang target sebelum data lapangan tersedia.

4. Pengguna dan Peran
Satu akun dapat memiliki lebih dari satu peran jika disetujui admin.

4.1 Buyer (Pembeli)
Contoh: pedagang, distributor, restoran, katering, toko, atau pengolah
pangan. - Mengelola profil bisnis dan alamat pengiriman. - Membuat
permintaan produk, jumlah, satuan, kualitas/grade, rentang harga, dan
tanggal dibutuhkan. - Melihat penawaran yang dikirim Avasthani. -
Menerima atau menolak penawaran. - Melihat pesanan, status pemenuhan,
dan riwayat transaksi. - Mengirim konfirmasi penerimaan atau melaporkan
masalah.

4.2 Farmer/Supplier (Petani/Pemasok)
Mengelola profil dan lokasi pemasok.
Mengajukan produk yang tersedia, satuan, estimasi stok, kualitas,
foto, dan periode ketersediaan.
Menerima permintaan pasokan dari tim Avasthani.
Mengirim harga pemasok dan estimasi kemampuan memenuhi.
Mengonfirmasi komitmen jumlah dan jadwal.
Memantau pesanan yang ditugaskan dan riwayat pemenuhan.
4.3 Admin/Operator Avasthani
Memverifikasi akun pembeli dan pemasok.
Meninjau katalog dan data stok.
Melihat permintaan masuk dan mencari pemasok.
Membuat perbandingan harga pemasok.
Menyusun penawaran kepada pembeli.
Membuat/mengelola pesanan dan memperbarui status operasional.
Mencatat biaya logistik, penyortiran, susut, dan biaya lain.
Menangani pembatalan, keluhan, dan rekonsiliasi.
Melihat laporan transaksi dan margin yang dibatasi berdasarkan hak
akses.
4.4 Super Admin
Mengelola akses admin, konfigurasi, kategori, satuan, wilayah, dan
audit.
Meninjau aktivitas berisiko dan laporan sistem.
Mengelola kebijakan akses dan parameter operasional.
4.5 Investor (di luar MVP transaksi)
Investor dapat menjadi persona atau peran pada roadmap, tetapi MVP tidak
menyediakan pengumpulan dana, saldo investasi, imbal hasil, penarikan,
atau penempatan dana. Jika kebutuhan investor hanya untuk melihat
laporan bisnis, gunakan laporan internal yang telah disetujui dan tidak
menampilkan klaim imbal hasil. Fitur pendanaan baru boleh ditentukan
setelah penilaian legal dan kepatuhan.

5. Ruang Lingkup
5.1 Termasuk MVP
Aplikasi mobile Android dan iOS.
Login, registrasi, reset password, dan manajemen sesi.
Profil pengguna dan bisnis.
Persetujuan/verifikasi akun oleh admin.
Katalog produk pertanian.
Data ketersediaan stok indikatif.
Permintaan pembelian (purchase request / RFQ).
Pencocokan pemasok secara manual oleh operator.
Penawaran harga kepada pembeli.
Konfirmasi penawaran dan pembuatan pesanan.
Status pesanan dan riwayat aktivitas.
Notifikasi push untuk peristiwa penting.
Upload foto produk dan bukti terkait.
Dashboard operasional sederhana untuk admin (dapat berupa antarmuka
admin terpisah pada fase implementasi).
Catatan biaya dan margin internal per pesanan.
Audit log untuk tindakan penting.
Pelaporan error, analitik dasar, dan pengamanan aplikasi.
5.2 Tidak termasuk MVP
Trading finansial, order-book, saham/komoditas berjangka, atau
spekulasi harga.
Penggalangan dana publik, wallet investasi, bunga/imbal hasil yang
dijanjikan, atau fitur investasi mandiri.
Algoritma pencocokan otomatis/AI sebagai prasyarat.
Lelang real-time atau chat real-time kompleks.
Pengiriman/logistik internal milik Avasthani.
Multi-negara atau dukungan pajak lintas negara.
Akuntansi lengkap, ERP, pembukuan pajak, dan integrasi bank
kompleks.
SaaS berlangganan penuh untuk petani.
Pembayaran escrow atau penahanan dana tanpa mitra pembayaran dan
kajian hukum yang sesuai.
6. Alur Utama
6.1 Permintaan pembeli hingga penawaran
Buyer masuk dan memilih "Buat Permintaan".
Buyer mengisi produk, jumlah/satuan, kualitas, lokasi, tanggal
dibutuhkan, rentang harga (opsional), dan catatan.
Sistem menyimpan permintaan dengan status SUBMITTED.
Operator meninjau dan mengubah status menjadi IN_REVIEW.
Operator menghubungi satu atau lebih pemasok dan mencatat harga,
jumlah tersedia, kualitas, serta waktu pengiriman.
Operator menyusun penawaran final kepada buyer, termasuk harga
satuan, biaya tambahan, total, masa berlaku, dan syarat.
Buyer menerima atau menolak penawaran.
Jika diterima, sistem membuat pesanan dengan snapshot harga dan
syarat yang disetujui.
6.2 Pemenuhan pesanan
Operator mengonfirmasi ketersediaan pemasok dan jadwal.
Pesanan bergerak melalui status operasional yang ditentukan.
Pihak terkait menerima notifikasi perubahan status.
Bukti pengiriman/penerimaan dapat dilampirkan.
Buyer mengonfirmasi barang diterima atau membuat laporan masalah.
Operator menutup pesanan setelah penyelesaian dan pencatatan biaya.
Sistem menghitung margin internal berdasarkan data biaya yang
tercatat.
6.3 Katalog pemasok
Supplier mengajukan produk dan data ketersediaan.
Data dapat berstatus PENDING_REVIEW.
Operator memverifikasi dan mempublikasikan data yang layak.
Stok pada MVP adalah indikatif dan harus dikonfirmasi sebelum
penawaran final.
7. Persyaratan Fungsional
Prioritas: P0 wajib untuk MVP, P1 penting setelah alur inti
stabil, P2 lanjutan.

ID Prioritas Persyaratan

FR-001 P0 Pengguna dapat
mendaftar, login,
logout, dan reset
password.

FR-002 P0 Pengguna dapat
mengelola profil dasar;
akun bisnis menyimpan
nama usaha dan kontak.

FR-003 P0 Admin dapat menyetujui,
menolak, atau meminta
perbaikan verifikasi
akun.

FR-004 P0 Supplier dapat
mengajukan produk,
foto, satuan, kualitas,
lokasi, dan stok
indikatif.

FR-005 P0 Buyer dapat
mencari/menjelajahi
produk yang telah
disetujui.

FR-006 P0 Buyer dapat membuat dan
melihat permintaan
pembelian.

FR-007 P0 Operator dapat mencatat
kandidat pemasok dan
respons harga untuk
permintaan.

FR-008 P0 Operator dapat membuat
penawaran dengan masa
berlaku, rincian harga,
biaya, dan syarat.

FR-009 P0 Buyer dapat menerima
atau menolak penawaran;
keputusan disimpan
sebagai peristiwa.

FR-010 P0 Penawaran yang diterima
dapat dikonversi
menjadi pesanan dengan
snapshot data yang
tidak berubah.

FR-011 P0 Status pesanan dapat
dilihat pihak yang
berwenang dan setiap
perubahan tercatat.

FR-012 P0 Sistem mengirim
notifikasi untuk
penawaran baru,
penawaran diterima,
perubahan status, dan
masalah pesanan.

FR-013 P0 Operator dapat mencatat
biaya dan margin
internal;
buyer/supplier tidak
boleh melihat data
margin internal.

FR-014 P0 Upload file dibatasi
berdasarkan tipe,
ukuran, kepemilikan,
dan izin akses.

FR-015 P0 Sistem menerapkan
role-based access
control melalui backend
dan Firestore Security
Rules.

FR-016 P0 Tindakan penting
memiliki audit log
dengan aktor, waktu,
objek, dan perubahan
yang relevan.

FR-017 P1 Buyer dapat membuat
daftar produk favorit
dan mengulang
permintaan sebelumnya.

FR-018 P1 Dashboard admin
menyediakan filter
status, tanggal,
wilayah, dan pemasok.

FR-019 P1 Ekspor laporan
transaksi terbatas
untuk role berwenang.

FR-020 P1 Pihak terkait dapat
melampirkan bukti
penerimaan atau
melaporkan
ketidaksesuaian.

FR-021 P2 Rekomendasi pemasok
atau prediksi kebutuhan
berbantuan AI setelah
tersedia data
berkualitas.

FR-022 P2 Modul SaaS untuk stok,
penjualan, pembelian,
dan laporan pemasok.

8. Aturan Bisnis
Semua harga menyimpan mata uang IDR dan satuan eksplisit (kg, gram,
ikat, karung, peti, dan sebagainya).
Konversi satuan harus eksplisit; sistem tidak boleh menganggap dua
satuan setara tanpa aturan konversi.
Stok katalog bersifat indikatif sampai pemasok mengonfirmasi
ketersediaan.
Penawaran memiliki masa berlaku dan tidak dapat diterima setelah
kedaluwarsa.
Saat penawaran diterima, harga, kuantitas, satuan, biaya, alamat,
dan syarat disalin sebagai snapshot pesanan.
Perubahan harga setelah persetujuan tidak boleh mengubah pesanan
yang sudah disetujui; perubahan memerlukan revisi/penawaran baru
atau persetujuan eksplisit.
Pembatalan dan refund mengikuti kebijakan yang ditetapkan secara
operasional dan disampaikan sebelum checkout.
Margin internal = nilai jual bersih − biaya pemasok − biaya
operasional yang dialokasikan. Rumus akuntansi final harus
disepakati; jangan menyebut margin sebagai laba bersih tanpa
memperhitungkan seluruh biaya.
Perubahan status dilakukan melalui fungsi backend tervalidasi, bukan
update bebas dari klien.
Semua waktu disimpan sebagai timestamp dan ditampilkan sesuai zona
waktu pengguna; operasi awal menggunakan WIB (Asia/Jakarta).
Data rekening, identitas, dan dokumen bisnis tidak boleh ditampilkan
ke pengguna yang tidak berwenang.
9. Model Status
Permintaan
DRAFT → SUBMITTED → IN_REVIEW → SOURCING → OFFERED → CONVERTED
Status terminal alternatif: REJECTED, CANCELLED, EXPIRED.

Penawaran
DRAFT → SENT → ACCEPTED
Status alternatif: REJECTED, EXPIRED, WITHDRAWN.

Pesanan
Contoh alur:
CONFIRMED → SUPPLIER_CONFIRMED → PREPARING → READY_FOR_DISPATCH → IN_DELIVERY → DELIVERED → COMPLETED.
Status alternatif: CANCEL_REQUESTED, CANCELLED, DISPUTED. Transisi
yang diizinkan harus didefinisikan di backend.

10. Persyaratan Nonfungsional
Keamanan dan privasi
Gunakan Firebase Authentication untuk identitas; jangan menyimpan
password sendiri.
Gunakan Firestore Security Rules dengan prinsip deny-by-default dan
akses minimum.
Gunakan Firebase App Check untuk mengurangi akses dari klien tidak
sah.
Gunakan Cloud Functions untuk validasi bisnis, perubahan status,
pembuatan penawaran/pesanan, perhitungan margin, dan tindakan admin
sensitif.
Admin SDK hanya berada di lingkungan server; jangan masukkan service
account key ke aplikasi.
Validasi input di klien dan server.
Simpan rahasia di Secret Manager/konfigurasi server yang sesuai.
Batasi akses file Firebase Storage dengan aturan yang sesuai.
Terapkan audit log dan minimisasi data pribadi.
Jangan mengandalkan role yang dikirim klien; klaim role harus
ditetapkan oleh lingkungan tepercaya.
Hindari menyimpan data kartu pembayaran; gunakan penyedia pembayaran
yang sesuai jika pembayaran online ditambahkan.
Kinerja dan reliabilitas
Layar utama harus menampilkan loading, empty, error, dan retry
state.
Daftar data menggunakan pagination; hindari mengambil seluruh
koleksi.
Operasi kritis harus idempotent atau memiliki proteksi terhadap
submit ganda.
Gunakan transaksi/batch Firestore jika konsistensi beberapa dokumen
diperlukan.
Operasi jaringan yang gagal harus memberi pesan yang dapat
ditindaklanjuti.
Sediakan Crashlytics dan Analytics dengan pengumpulan data yang
proporsional.
Aksesibilitas dan kegunaan
Bahasa utama MVP: Bahasa Indonesia.
Format harga: Rupiah; jumlah dan satuan mudah dibaca.
Target sentuh yang memadai, kontras yang jelas, label form yang
eksplisit.
Rancang untuk perangkat Android kelas menengah dan koneksi internet
yang tidak selalu stabil.
Hindari mengandalkan warna saja untuk menyampaikan status.
11. Teknologi dan Arsitektur
Mobile
React Native + Expo Development Build + TypeScript.
React Native Firebase native SDK untuk integrasi Firebase.
Nativewind sebagai pendekatan styling utama.
Jangan mengasumsikan Expo Go mendukung modul native yang diperlukan;
gunakan development build.
Firebase
Firebase Authentication: login dan identitas.
Cloud Firestore: data aplikasi operasional.
Firebase Storage: foto produk dan dokumen yang diizinkan.
Cloud Functions for Firebase: aturan bisnis dan operasi tepercaya.
Firebase Cloud Messaging (FCM): push notification.
Firebase App Check: perlindungan akses aplikasi.
Firebase Analytics: penggunaan fitur secara agregat.
Firebase Crashlytics: pemantauan crash.
Pemisahan data
Satu Firebase project dapat memiliki satu atau beberapa database
Firestore, tetapi untuk MVP disarankan mulai dengan satu database
Firestore utama dan pemisahan akses melalui struktur dokumen,
tenant/organisasi bila diperlukan, Rules, dan backend. Jangan membuat
database terpisah per peran hanya karena ada investor, petani, dan
buyer. Database terpisah menambah beban operasi dan tidak menggantikan
kontrol akses. Jika kemudian ada kebutuhan isolasi yang nyata, evaluasi
pemisahan project/database berdasarkan lingkungan, kepatuhan, atau batas
operasional.

Lingkungan
Pisahkan project Firebase development, staging (opsional sesuai
kapasitas), dan production.
Jangan gunakan data pelanggan nyata pada lingkungan pengembangan.
Atur budget alert dan pantau biaya Firestore reads/writes, Storage,
Functions, dan pesan FCM.
12. Model Data Tingkat Tinggi
Koleksi yang disarankan: - users/{uid} --- profil pengguna dan status
akun; role/claims sensitif dikelola server. - businesses/{businessId}
--- profil usaha dan pemilik/anggota. -
businessMemberships/{membershipId} --- relasi user ke bisnis dan
izin. - products/{productId} --- katalog produk pertanian. -
supplierOffers/{offerId} --- respons pemasok untuk kebutuhan
tertentu. - purchaseRequests/{requestId} --- permintaan buyer. -
buyerQuotes/{quoteId} --- penawaran final dari Avasthani ke buyer. -
orders/{orderId} --- pesanan dan snapshot kesepakatan. -
orders/{orderId}/events/{eventId} --- timeline aktivitas pesanan. -
orderCosts/{costId} --- biaya operasional internal. -
notifications/{notificationId} atau subkoleksi per pengguna. -
files/{fileId} --- metadata file jika diperlukan. -
auditLogs/{logId} --- log perubahan sensitif. -
categories/{categoryId} --- kategori dan satuan yang diizinkan.

Gunakan ID acak yang tidak dapat ditebak, createdAt, updatedAt,
createdBy, status eksplisit, dan indeks yang sesuai. Jangan
mengandalkan query/filter di UI sebagai mekanisme keamanan.

13. Analitik dan Pelaporan
Event yang dapat dilacak secara agregat: - signup_completed -
business_verification_submitted - product_submitted -
purchase_request_submitted - supplier_response_recorded -
quote_sent - quote_accepted - order_completed -
order_cancelled - issue_reported

Jangan mengirim nama, nomor telepon, alamat, dokumen identitas, atau
data sensitif sebagai parameter Analytics.

14. Risiko dan Mitigasi
Risiko Mitigasi

Harga dan stok berubah cepat Tandai stok indikatif; minta
konfirmasi pemasok sebelum
penawaran final.

Kualitas barang tidak konsisten Definisikan grade, foto,
spesifikasi, dan proses komplain.

Pembeli/pemasok tidak memenuhi Verifikasi bisnis, catat riwayat
komitmen pemenuhan, dan tetapkan kebijakan
pembatalan.

Margin tergerus logistik/susut Catat biaya per pesanan dan
evaluasi margin setelah setiap
transaksi.

Akses data lintas pengguna Security Rules deny-by-default,
pengujian Rules, App Check, dan
operasi sensitif melalui Functions.

Biaya Firebase meningkat Pagination, query terindeks,
hindari listener berlebihan, budget
alert, dan review biaya.

Fitur investor menimbulkan risiko Tidak ada pengelolaan
hukum dana/investasi di MVP; lakukan
kajian hukum sebelum peluncuran.

Adopsi rendah Validasi dengan pembeli dan pemasok
nyata sebelum membangun fitur
lanjutan.

15. Kriteria Penerimaan MVP
MVP siap diuji dengan pengguna nyata terbatas apabila: - Buyer dan
supplier dapat membuat akun dan menyelesaikan verifikasi yang sesuai. -
Supplier dapat mengajukan produk dan operator dapat meninjau produk. -
Buyer dapat membuat permintaan dengan satuan dan jadwal yang jelas. -
Operator dapat mencatat respons pemasok dan mengirim penawaran final. -
Buyer dapat menerima/menolak penawaran. - Penawaran yang diterima
membuat satu pesanan saja meski permintaan dikirim ulang. - Pengguna
hanya melihat data yang berhak diaksesnya. - Transisi status ilegal
ditolak di backend. - Biaya dan margin internal tidak terlihat oleh
buyer/supplier. - Peristiwa penting tercatat dan notifikasi utama
terkirim. - Aturan Firestore dan Storage diuji, termasuk skenario akses
tidak sah. - Crash reporting dan budget alert aktif. - Tim operasional
dapat menyelesaikan satu transaksi uji dari awal sampai akhir.

16. Roadmap
Fase 0 --- Validasi operasional
Wawancara buyer dan pemasok di Garut/Tasikmalaya.
Jalankan beberapa transaksi secara manual untuk memetakan variasi
kualitas, logistik, susut, pembayaran, dan komplain.
Tetapkan produk awal, satuan, wilayah layanan, SLA, dan kebijakan
pembatalan.
Fase 1 --- MVP
Auth, profil, verifikasi.
Katalog pemasok.
Purchase request, pencarian pemasok, penawaran, pesanan, status,
notifikasi.
Catatan biaya, margin internal, dan audit log.
Uji coba dengan kelompok pengguna terbatas.
Fase 2 --- Efisiensi operasi
Dashboard admin lebih lengkap.
Laporan dan ekspor.
Reorder, favorit, dan pengelolaan pemasok.
Perbaikan berdasarkan data konversi dan kegagalan pemenuhan.
Fase 3 --- Monetisasi lanjutan
Evaluasi biaya layanan atau langganan SaaS untuk pemasok.
Fitur pembayaran melalui mitra yang sesuai.
Rekomendasi pemasok berbantuan data.
Kajian terpisah untuk fitur pendanaan/investor sebelum menentukan
ruang lingkupnya.
17. Pertanyaan yang Harus Diputuskan Sebelum Produksi
Apakah pembayaran dilakukan langsung antara buyer dan supplier, atau
melalui Avasthani?
Siapa yang bertanggung jawab atas pengiriman, pemeriksaan kualitas,
susut, dan klaim?
Apakah harga buyer sudah termasuk logistik dan pajak?
Produk dan satuan apa yang menjadi fokus uji coba pertama?
Apakah admin dashboard dibangun sebagai web terpisah atau sementara
memakai tooling internal?
Apa dokumen verifikasi minimum untuk buyer dan supplier?
Kebijakan pembatalan, pengembalian, dan sengketa seperti apa yang
disepakati?
Apakah modul investor benar-benar diperlukan pada fase awal? Jika
ya, apa struktur legal dan operasionalnya?
Dokumen ini merupakan dasar produk dan perlu divalidasi dengan proses
bisnis lapangan, kebijakan legal, serta hasil uji coba sebelum dipakai
sebagai spesifikasi produksi final.



⋮⋮⋮⋮