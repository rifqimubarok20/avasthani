import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, writeBatch } from '@react-native-firebase/firestore';
import type { User } from '@react-native-firebase/auth';
import type { Business, BusinessAddress, Role, UserProfile } from '@/types';
import { getFirebaseFirestore } from './firebase/firestore';

export type AccountData = {
  profile: UserProfile | null;
  business: Business | null;
  role: Role | null;
};

const PROFILE_WRITE_TIMEOUT_MS = 20_000;

export async function loadAccount(user: User): Promise<AccountData> {
  const db = await getFirebaseFirestore();
  const profileSnapshot = await getDoc(doc(db, 'users', user.uid));
  if (!profileSnapshot.exists()) return { profile: null, business: null, role: null };
  const profile = profileSnapshot.data() as UserProfile;
  const membershipSnapshot = await getDocs(query(collection(db, 'businessMemberships'), where('userId', '==', user.uid)));
  const membership = membershipSnapshot.docs[0]?.data() as { businessId: string; role: Role } | undefined;
  if (!membership) return { profile, business: null, role: null };
  const businessSnapshot = await getDoc(doc(db, 'businesses', membership.businessId));
  return {
    profile,
    business: businessSnapshot.exists() ? (businessSnapshot.data() as Business) : null,
    role: membership.role,
  };
}

export async function createBusinessProfile(
  user: User,
  values: { displayName: string; businessName: string; role: 'BUYER' | 'SUPPLIER'; phoneNumber: string; province: string; city: string; district?: string; addressLine: string },
) {
  const db = await getFirebaseFirestore();
  const businessRef = doc(collection(db, 'businesses'));
  const membershipId = `${user.uid}_${businessRef.id}`;
  const membershipRef = doc(db, 'businessMemberships', membershipId);
  const userRef = doc(db, 'users', user.uid);
  const now = serverTimestamp();
  const batch = writeBatch(db);
  batch.set(userRef, {
    uid: user.uid,
    displayName: values.displayName,
    phoneNumber: values.phoneNumber,
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    status: 'PENDING_VERIFICATION',
    businessIds: [businessRef.id],
    preferredRole: values.role,
    createdAt: now,
    updatedAt: now,
  });
  batch.set(businessRef, {
    id: businessRef.id,
    name: values.businessName,
    type: values.role,
    ownerUid: user.uid,
    memberUids: [user.uid],
    phone: values.phoneNumber,
    address: {
      province: values.province,
      city: values.city,
      ...(values.district ? { district: values.district } : {}),
      addressLine: values.addressLine,
    },
    verificationStatus: 'PENDING',
    createdAt: now,
    updatedAt: now,
  });
  batch.set(membershipRef, {
    userId: user.uid,
    businessId: businessRef.id,
    role: values.role,
    status: 'ACTIVE',
    createdAt: now,
  });
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      batch.commit(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          reject(Object.assign(new Error('Firestore tidak merespons dalam batas waktu.'), { code: 'profile/write-timeout' }));
        }, PROFILE_WRITE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

/**
 * Perbarui data pribadi di dokumen pengguna.
 * Hanya menyentuh field yang diizinkan Storage/Firestore Rules untuk pengguna
 * sendiri: displayName, phoneNumber, photoURL, dan updatedAt.
 */
export async function updateUserProfile(uid: string, values: { displayName?: string; phoneNumber?: string }): Promise<void> {
  const db = await getFirebaseFirestore();
  const patch: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (values.displayName !== undefined) patch.displayName = values.displayName.trim();
  if (values.phoneNumber !== undefined) patch.phoneNumber = values.phoneNumber.trim();
  await updateDoc(doc(db, 'users', uid), patch);
}

/** Perbarui alamat usaha. Field lain pada dokumen bisnis dijaga tidak berubah. */
export async function updateBusinessAddress(businessId: string, address: BusinessAddress): Promise<void> {
  const db = await getFirebaseFirestore();
  await updateDoc(doc(db, 'businesses', businessId), { address, updatedAt: serverTimestamp() });
}
