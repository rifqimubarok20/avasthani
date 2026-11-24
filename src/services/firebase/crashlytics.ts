import { getCrashlytics } from '@react-native-firebase/crashlytics';
import { getFirebaseApp } from './app';

export async function getFirebaseCrashlytics() {
  return getCrashlytics(await getFirebaseApp());
}
