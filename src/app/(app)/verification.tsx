import { signOut } from '@react-native-firebase/auth';
import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Notice, Page, PrimaryButton, Title } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { getFirebaseAuth } from '@/services/firebase/auth';
import { useColors } from '@/theme/ThemeProvider';

export default function Verification() {
  const c = useColors();
  const { account } = useAuth();
  const rejected = account.business?.verificationStatus === 'REJECTED';
  const statusLabel = rejected ? 'Perlu perbaikan' : 'Menunggu verifikasi';
  const logout = async () => { try { await signOut(await getFirebaseAuth()); router.replace('/(auth)/login'); } catch { Alert.alert('Tidak dapat keluar', 'Coba lagi.'); } };
  return <Page><Title title={statusLabel} subtitle={rejected ? 'Profil usaha belum dapat disetujui.' : 'Data profil usaha Anda sedang ditinjau.'} /><Notice tone={rejected ? 'error' : 'info'}>{rejected ? 'Silakan hubungi tim dukungan untuk mengetahui data yang perlu diperbaiki.' : 'Kami akan memberi tahu Anda setelah proses verifikasi selesai. Anda dapat masuk kembali kapan saja untuk melihat statusnya.'}</Notice><View style={{ backgroundColor: c.surface, borderRadius: 12, padding: 18, borderWidth: 1, borderColor: c.border, gap: 10 }}><Text style={{ color: c.textSecondary, fontSize: 13 }}>USAHA</Text><Text style={{ color: c.textPrimary, fontSize: 18, fontWeight: '700' }}>{account.business?.name ?? 'Profil belum lengkap'}</Text><Text style={{ color: c.textSecondary }}>{account.business?.address.city ?? ''}{account.business?.address.province ? `, ${account.business.address.province}` : ''}</Text><Text style={{ color: c.textPrimary, fontWeight: '600', marginTop: 8 }}>Status: {account.business?.verificationStatus ?? 'PENDING'}</Text></View><PrimaryButton title="Keluar" onPress={() => void logout()} /></Page>;
}
