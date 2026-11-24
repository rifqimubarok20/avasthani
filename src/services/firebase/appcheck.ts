import { initializeAppCheck } from '@react-native-firebase/app-check';
import { getFirebaseApp } from './app';

/**
 * Inisialisasi Firebase App Check (dilakukan sekali saat aplikasi mulai).
 * Memerlukan provider App Check yang terdaftar di Firebase Console.
 */
export async function initializeFirebaseAppCheck() {
  const app = await getFirebaseApp();
  return initializeAppCheck(app);
}
