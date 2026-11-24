import {
  getApps,
  initializeApp,
  FirebaseApp,
} from '@react-native-firebase/app';
import type { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Konfigurasi Firebase klien diambil dari environment variabel (EXPO_PUBLIC_*).
 * Nilai sebenarnya diisi developer dari Firebase Console dan disimpan di .env
 * (tidak dikommit ke repository). Kunci rahasia (service account / Admin SDK)
 * JANGAN dimasukkan ke aplikasi mobile.
 */
export function getFirebaseConfig(): ReactNativeFirebase.FirebaseAppOptions {
  return {
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
}

let appPromise: Promise<FirebaseApp> | null = null;

/**
 * Dapatkan instance Firebase App (initializeApp bersifat async di React Native Firebase).
 * Dipegang agar tidak memicu error saat konfigurasi belum lengkap.
 */
export async function getFirebaseApp(): Promise<FirebaseApp> {
  if (!appPromise) {
    if (getApps().length > 0) {
      appPromise = Promise.resolve(getApps()[0]);
    } else {
      const config = getFirebaseConfig();
      if (!config.appId || !config.projectId) {
        throw new Error(
          'Firebase client config belum lengkap: EXPO_PUBLIC_FIREBASE_APP_ID dan EXPO_PUBLIC_FIREBASE_PROJECT_ID harus diisi di .env (lihat .env.example).'
        );
      }
      appPromise = initializeApp(config);
    }
  }
  return appPromise;
}
