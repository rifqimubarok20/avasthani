import { GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { TurboModuleRegistry } from 'react-native';
import { getFirebaseAuth } from './auth';

let configured = false;

export async function signInWithGoogle() {
  if (!TurboModuleRegistry.get('NitroModules')) {
    throw new Error('google/native-module-unavailable');
  }

  // Load the native module only when the user taps Google sign-in. This keeps
  // the rest of the app usable in an older dev client that has not been rebuilt.
  const {
    GoogleOneTapSignIn,
    isCancelledResponse,
    isNoSavedCredentialFoundResponse,
    isSuccessResponse,
  } = await import('react-native-nitro-google-signin');

  if (!configured) {
    GoogleOneTapSignIn.configure({
      webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID || 'autoDetect',
    });
    configured = true;
  }

  await GoogleOneTapSignIn.checkPlayServices();
  let response = await GoogleOneTapSignIn.signIn();
  if (isNoSavedCredentialFoundResponse(response)) {
    response = await GoogleOneTapSignIn.createAccount();
  }
  if (isNoSavedCredentialFoundResponse(response)) {
    response = await GoogleOneTapSignIn.presentExplicitSignIn();
  }
  if (isCancelledResponse(response)) return null;
  if (!isSuccessResponse(response) || !response.data.idToken) {
    throw new Error('google/no-id-token');
  }

  const credential = GoogleAuthProvider.credential(response.data.idToken);
  return signInWithCredential(await getFirebaseAuth(), credential);
}

export function googleSignInErrorMessage(error: unknown) {
  const code = (error as { code?: string })?.code;
  const message = error instanceof Error ? error.message : '';
  if (message === 'google/native-module-unavailable') {
    return 'Google Sign-In perlu binary Android terbaru. Jalankan npx expo run:android untuk membangun dan memasang modul native.';
  }
  if (message.includes('Failed to get NitroModules')) {
    return 'Google Sign-In perlu binary Android terbaru. Jalankan ulang npx expo run:android untuk membangun dan memasang modul native.';
  }
  if (code === 'DEVELOPER_ERROR') {
    return 'Konfigurasi Google belum cocok. Periksa OAuth client ID, SHA-1, dan google-services.json di Firebase.';
  }
  if (code === 'PLAY_SERVICES_NOT_AVAILABLE') {
    return 'Google Play Services tidak tersedia. Gunakan emulator dengan image Google Play.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Login Google belum diaktifkan pada Firebase Authentication.';
  }
  if (code === 'google/no-id-token') {
    return 'Google tidak memberikan token masuk. Periksa OAuth client ID dan coba lagi.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Periksa koneksi internet, lalu coba lagi.';
  }
  return 'Tidak dapat masuk dengan Google saat ini. Coba lagi.';
}
