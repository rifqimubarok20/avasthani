// =============================================================================
// Avasthani - Foto profil (avatar)
//
// Batas 2 MB ditegakkan dua kali:
//   1. di aplikasi, sebelum upload (supaya hemat kuota pengguna)
//   2. di Storage Rules, supaya tidak bisa dilewati dengan memanggil SDK langsung
// =============================================================================

import { doc, serverTimestamp, updateDoc } from '@react-native-firebase/firestore';
import { getDownloadURL, putFile, ref as storageRef } from '@react-native-firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { getFirebaseFirestore } from './firebase/firestore';
import { getFirebaseStorage } from './firebase/storage';

export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export type AvatarPick =
  | { status: 'cancelled' }
  | { status: 'too-large'; sizeBytes: number }
  | { status: 'picked'; uri: string; mimeType: string; sizeBytes: number };

export function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Buka galeri dan validasi ukuran. `quality` minta kompresi dari sistem,
 * jadi berkas yang dicek di sini adalah berkas hasil kompresi.
 */
export async function pickAvatar(): Promise<AvatarPick> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Izin galeri ditolak. Aktifkan izin foto untuk Avasthani di pengaturan HP.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return { status: 'cancelled' };

  const asset = result.assets[0];
  const sizeBytes = asset.fileSize ?? 0;
  if (sizeBytes > MAX_AVATAR_BYTES) return { status: 'too-large', sizeBytes };

  return {
    status: 'picked',
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'image/jpeg',
    sizeBytes,
  };
}

/**
 * Unggah avatar lalu simpan URL-nya ke dokumen pengguna.
 * Path sengaja tetap per pengguna (bukan per unggahan) agar foto lama tertimpa
 * dan tidak menumpuk di Storage.
 */
export async function uploadAvatar(
  uid: string,
  image: { uri: string; mimeType: string }
): Promise<string> {
  const mimeType = ALLOWED_MIME[image.mimeType] ? image.mimeType : 'image/jpeg';
  const extension = ALLOWED_MIME[mimeType];
  const fileRef = storageRef(await getFirebaseStorage(), `avatars/${uid}/profile.${extension}`);

  await putFile(fileRef, image.uri, { contentType: mimeType });
  const photoURL = await getDownloadURL(fileRef);

  const db = await getFirebaseFirestore();
  await updateDoc(doc(db, 'users', uid), { photoURL, updatedAt: serverTimestamp() });

  return photoURL;
}
