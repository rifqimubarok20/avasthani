import { collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, where, writeBatch } from '@react-native-firebase/firestore';
import { deleteObject as deleteStorageObject, getDownloadURL, ref as storageRef, putFile } from '@react-native-firebase/storage';
import { getFirebaseFirestore } from '@/services/firebase/firestore';
import { getFirebaseStorage } from '@/services/firebase/storage';
import type { Category, Product, Unit } from '@/types';
import type { ProductInput } from '@/schemas';
import { DEFAULT_CATEGORIES, DEFAULT_UNITS } from './options';

export async function listCategories(): Promise<Category[]> {
  const db = await getFirebaseFirestore();
  const snap = await getDocs(query(collection(db, 'categories'), where('active', '==', true), orderBy('sortOrder')));
  return snap.empty ? DEFAULT_CATEGORIES : snap.docs.map((item) => item.data() as Category);
}
export async function listUnits(): Promise<Unit[]> {
  const db = await getFirebaseFirestore();
  const snap = await getDocs(query(collection(db, 'units'), where('active', '==', true)));
  return snap.empty ? DEFAULT_UNITS : snap.docs.map((item) => item.data() as Unit);
}
export async function listApprovedProducts(): Promise<Product[]> {
  const db = await getFirebaseFirestore();
  const snap = await getDocs(query(collection(db, 'products'), where('reviewStatus', '==', 'APPROVED'), orderBy('updatedAt', 'desc'), limit(100)));
  return snap.docs.map((item) => item.data() as Product);
}
export async function listSupplierProducts(businessId: string, uid: string): Promise<Product[]> {
  const db = await getFirebaseFirestore();
  const snap = await getDocs(query(collection(db, 'products'), where('supplierBusinessId', '==', businessId), where('createdByUid', '==', uid), orderBy('updatedAt', 'desc')));
  return snap.docs.map((item) => item.data() as Product);
}
export async function listPendingProducts(): Promise<Product[]> {
  const db = await getFirebaseFirestore();
  const snap = await getDocs(query(collection(db, 'products'), where('reviewStatus', '==', 'PENDING_REVIEW'), orderBy('createdAt')));
  return snap.docs.map((item) => item.data() as Product);
}
export async function seedCatalogOptions() {
  const db = await getFirebaseFirestore();
  const batch = writeBatch(db);
  const now = serverTimestamp();
  for (const category of DEFAULT_CATEGORIES) {
    batch.set(doc(db, 'categories', category.id), { id: category.id, name: category.name, active: true, sortOrder: category.sortOrder, createdAt: now, updatedAt: now }, { merge: true });
  }
  for (const unit of DEFAULT_UNITS) {
    batch.set(doc(db, 'units', unit.id), { id: unit.id, name: unit.name, active: true, createdAt: now, updatedAt: now }, { merge: true });
  }
  await batch.commit();
}
export async function getProduct(productId: string): Promise<Product | null> {
  const db = await getFirebaseFirestore();
  const snapshot = await getDoc(doc(db, 'products', productId));
  return snapshot.exists() ? snapshot.data() as Product : null;
}

export async function submitProduct(input: ProductInput, owner: { uid: string; businessId: string }, image: { uri: string; mimeType?: string | null }) {
  const db = await getFirebaseFirestore();
  const productRef = doc(collection(db, 'products'));
  const mimeType = ['image/jpeg', 'image/png', 'image/webp'].includes(image.mimeType ?? '') ? image.mimeType! : 'image/jpeg';
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const imagePath = `product-images/${owner.businessId}/${productRef.id}/${owner.uid}_cover.${extension}`;
  const fileRef = storageRef(await getFirebaseStorage(), imagePath);
  await putFile(fileRef, image.uri, { contentType: mimeType });
  try {
    const imageUrl = await getDownloadURL(fileRef);
    const product: Product = {
      id: productRef.id,
      supplierBusinessId: owner.businessId,
      createdByUid: owner.uid,
      name: input.name,
      categoryId: input.categoryId,
      ...(input.description ? { description: input.description } : {}),
      images: [imageUrl],
      baseUnit: input.baseUnit,
      ...(input.grade ? { grade: input.grade } : {}),
      ...(input.indicativeStock !== undefined ? { indicativeStock: input.indicativeStock } : {}),
      ...(input.indicativePricePerUnit !== undefined ? { indicativePricePerUnit: input.indicativePricePerUnit } : {}),
      availabilityStatus: input.availabilityStatus,
      reviewStatus: 'PENDING_REVIEW',
      location: { city: input.city, ...(input.district ? { district: input.district } : {}) },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(productRef, product);
    return productRef.id;
  } catch (error) {
    await deleteStorageObject(fileRef).catch(() => undefined);
    throw error;
  }
}

export async function moderateProduct(product: Product, decision: 'APPROVED' | 'REJECTED', note?: string) {
  const db = await getFirebaseFirestore();
  await setDoc(doc(db, 'products', product.id), {
    reviewStatus: decision,
    reviewNote: decision === 'REJECTED' && note?.trim() ? note.trim().slice(0, 300) : null,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
