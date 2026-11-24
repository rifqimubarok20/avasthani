import { getMessaging } from '@react-native-firebase/messaging';
import { getFirebaseApp } from './app';

export async function getFirebaseMessaging() {
  return getMessaging(await getFirebaseApp());
}
