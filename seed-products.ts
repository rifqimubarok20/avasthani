import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const DEFAULT_CATEGORIES = [
  { id: 'sayuran', name: 'Sayuran', active: true, sortOrder: 1 },
  { id: 'buah', name: 'Buah', active: true, sortOrder: 2 },
  { id: 'umbi', name: 'Umbi-umbian', active: true, sortOrder: 3 },
  { id: 'rempah', name: 'Rempah', active: true, sortOrder: 4 },
  { id: 'biji', name: 'Biji-bijian', active: true, sortOrder: 5 },
  { id: 'bibit', name: 'Bibit & Benih', active: true, sortOrder: 7 },
  { id: 'pupuk', name: 'Pupuk & Agrokimia', active: true, sortOrder: 8 },
  { id: 'alat', name: 'Alat & Mesin', active: true, sortOrder: 9 },
  { id: 'lainnya', name: 'Lainnya', active: true, sortOrder: 10 },
];

const DEFAULT_UNITS = [
  { id: 'kg', name: 'kg' },
  { id: 'gram', name: 'gram' },
  { id: 'ton', name: 'ton' },
  { id: 'ikat', name: 'ikat' },
  { id: 'karung', name: 'karung' },
  { id: 'peti', name: 'peti' },
  { id: 'pcs', name: 'pcs' },
  { id: 'paket', name: 'paket' },
];

const sampleProducts = [
  {
    name: 'Bibit Cabai ORI 212',
    categoryId: 'bibit',
    description: 'Bibit Cabai ORI 212 yang dikemas secara aman dan pastinya bisa tumbuh 95%. Varietas unggul dengan hasil panen tinggi dan tahan terhadap hama utama cabai.',
    baseUnit: 'pcs',
    grade: 'ORI Type A & Type B',
    indicativeStock: 20,
    indicativePricePerUnit: 16000,
    availabilityStatus: 'AVAILABLE',
    city: 'Bandung',
    district: 'Lembang',
  },
  {
    name: 'Bibit Tomat Tyrano F1',
    categoryId: 'bibit',
    description: 'Bibit tomat hybrida Tyrano F1, tahan layu fusarium dan virus gemini. Cocok untuk lahan dataran tinggi dan rendah. Siap panen 60-65 HST.',
    baseUnit: 'pcs',
    grade: 'Grade A',
    indicativeStock: 50,
    indicativePricePerUnit: 12000,
    availabilityStatus: 'AVAILABLE',
    city: 'Malang',
    district: 'Dampit',
  },
  {
    name: 'Pupuk NPK 15-15-15 Mutiara',
    categoryId: 'pupuk',
    description: 'Pupuk majemuk NPK 15-15-15 berkualitas tinggi untuk pemupukan dasar dan lanjutan tanaman sayuran, buah, dan tanaman pangan.',
    baseUnit: 'kg',
    indicativeStock: 500,
    indicativePricePerUnit: 8500,
    availabilityStatus: 'AVAILABLE',
    city: 'Surabaya',
    district: 'Gresik',
  },
  {
    name: 'Bibit Bawang Merah Tuktuk',
    categoryId: 'bibit',
    description: 'Bibit bawang merah varietas Tuktuk, umur panen 90-100 hari, bentuk bulat merata, tahan penyakit busuk pangkal.',
    baseUnit: 'pcs',
    grade: 'Super',
    indicativeStock: 1000,
    indicativePricePerUnit: 2500,
    availabilityStatus: 'AVAILABLE',
    city: 'Brebes',
    district: 'Brebes',
  },
  {
    name: 'Pupuk Organik Granul Kompos',
    categoryId: 'pupuk',
    description: 'Pupuk organik granul dari kompos ternak yang telah difermentasi. Kaya humus, memperbaiki struktur tanah, dan meningkatkan aktivitas mikroba.',
    baseUnit: 'kg',
    indicativeStock: 2000,
    indicativePricePerUnit: 3500,
    availabilityStatus: 'AVAILABLE',
    city: 'Sukabumi',
    district: 'Cianjur',
  },
];

async function seedCategoriesAndUnits() {
  console.log('Seeding categories and units...');
  const batch = db.batch();
  const now = Timestamp.now();

  for (const cat of DEFAULT_CATEGORIES) {
    const ref = db.collection('categories').doc(cat.id);
    batch.set(ref, { ...cat, createdAt: now, updatedAt: now }, { merge: true });
  }
  for (const unit of DEFAULT_UNITS) {
    const ref = db.collection('units').doc(unit.id);
    batch.set(ref, { ...unit, createdAt: now, updatedAt: now }, { merge: true });
  }
  await batch.commit();
  console.log('Categories and units seeded.');
}

async function seedProducts(supplierBusinessId: string, createdByUid: string) {
  console.log('Seeding products...');
  const now = Timestamp.now();

  for (const product of sampleProducts) {
    const ref = db.collection('products').doc();
    await ref.set({
      id: ref.id,
      supplierBusinessId,
      createdByUid,
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      images: [],
      baseUnit: product.baseUnit,
      grade: product.grade,
      indicativeStock: product.indicativeStock,
      indicativePricePerUnit: product.indicativePricePerUnit,
      availabilityStatus: product.availabilityStatus,
      reviewStatus: 'APPROVED',
      location: { city: product.city, district: product.district },
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Created: ${product.name} (${ref.id})`);
  }
  console.log('Products seeded.');
}

async function main() {
  const supplierBusinessId = process.argv[2] || 'demo-supplier-id';
  const createdByUid = process.argv[3] || 'demo-user-id';

  console.log(`Using supplierBusinessId: ${supplierBusinessId}`);
  console.log(`Using createdByUid: ${createdByUid}`);

  try {
    await seedCategoriesAndUnits();
    await seedProducts(supplierBusinessId, createdByUid);
    console.log('✅ All seeding completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

main();