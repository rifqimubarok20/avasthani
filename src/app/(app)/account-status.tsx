import { signOut } from '@react-native-firebase/auth';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { Text } from '@/components/AppText';
import { Notice, Page, PrimaryButton, Title } from '@/components/ui';
import { getFirebaseAuth } from '@/services/firebase/auth';

export default function AccountStatus() {
  const logout = async () => { try { await signOut(await getFirebaseAuth()); router.replace('/(auth)/login'); } catch { Alert.alert('Tidak dapat keluar', 'Coba lagi.'); } };
  return <Page><Title title="Akun dinonaktifkan" subtitle="Akun ini tidak dapat mengakses layanan saat ini." /><Notice tone="error">Hubungi tim Avasthani jika Anda memerlukan informasi lebih lanjut.</Notice><PrimaryButton title="Keluar" onPress={() => void logout()} /><Text accessibilityRole="text" style={{ textAlign: 'center', marginTop: 20, color: '#66736A' }}>Status akun dikelola oleh tim Avasthani.</Text></Page>;
}
