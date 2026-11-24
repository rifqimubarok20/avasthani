import { getFirestore } from '@react-native-firebase/firestore';
import { getFirebaseApp } from './app';

export async function getFirebaseFirestore() {
  return getFirestore(await getFirebaseApp());
}
