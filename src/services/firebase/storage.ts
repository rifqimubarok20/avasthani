import { getStorage } from '@react-native-firebase/storage';
import { getFirebaseApp } from './app';

export async function getFirebaseStorage() {
  return getStorage(await getFirebaseApp());
}
