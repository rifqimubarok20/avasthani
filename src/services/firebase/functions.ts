import { getFunctions, httpsCallable } from '@react-native-firebase/functions';
import { getFirebaseApp } from './app';

// Harus sama dengan region Cloud Functions (lihat functions/src/ai/recommend.ts).
const FUNCTIONS_REGION = process.env.EXPO_PUBLIC_FUNCTIONS_REGION ?? 'asia-southeast2';

/**
 * Buat referensi callable Cloud Functions.
 * Contoh: const fn = await getCallableFunction('createOrderFromAcceptedQuote');
 *         const result = await fn({ quoteId });
 */
export async function getCallableFunction(name: string) {
  const functions = getFunctions(await getFirebaseApp(), FUNCTIONS_REGION);
  return httpsCallable(functions, name);
}
