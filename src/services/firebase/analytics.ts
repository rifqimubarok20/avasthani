import { getAnalytics } from '@react-native-firebase/analytics';
import { getFirebaseApp } from './app';

export async function getFirebaseAnalytics() {
  return getAnalytics(await getFirebaseApp());
}
