import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import type { User } from '@react-native-firebase/auth';
import { getFirebaseApp } from './app';

export async function getFirebaseAuth() {
  return getAuth(await getFirebaseApp());
}

export async function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(await getFirebaseAuth(), callback);
}
