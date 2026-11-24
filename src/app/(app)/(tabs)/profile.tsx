import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { signOut } from '@react-native-firebase/auth';
import { Link, router } from 'expo-router';
import { Text } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { MenuGroup, type MenuItem } from '@/components/MenuRow';
import { Notice, Page } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { authenticateBiometric, getBiometricSupport, type BiometricSupport } from '@/features/auth/biometric';
import { uploadAvatar, pickAvatar, MAX_AVATAR_BYTES, formatMegabytes } from '@/services/avatar';
import { getFirebaseAuth } from '@/services/firebase/auth';
import { loadPreferences, savePreferences, type Preferences } from '@/services/preferences';
import { useTheme } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export default function ProfileTab() {
  const { user, account } = useAuth();
  const { colors, dark, setDark } = useTheme();
  const s = styles(colors);
  const displayName = account.profile?.displayName ?? user?.displayName ?? '';
  const photoURL = account.profile?.photoURL ?? user?.photoURL ?? '';
  const setupNeeded = !account.business;
  const verification = account.business?.verificationStatus;

  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [biometric, setBiometric] = useState<BiometricSupport | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([loadPreferences(), getBiometricSupport()]).then(([value, info]) => {
      if (!active) return;
      setPrefs(value);
      setBiometric(info);
    });
    return () => { active = false; };
  }, []);

  const changeAvatar = async () => {
    const picked = await pickAvatar();
    if (picked.status === 'cancelled') return;
    if (picked.status === 'too-large') {
      Alert.alert('Foto terlalu besar', `Ukuran foto ${formatMegabytes(picked.sizeBytes)}. Batas maksimal ${formatMegabytes(MAX_AVATAR_BYTES)}.`, [
        { text: 'Mengerti' },
      ]);
      return;
    }
    if (!user) return;
    setUploading(true);
    try {
      await uploadAvatar(user.uid, picked);
    } catch (e) {
      console.error('Unggah foto profil gagal', e);
      Alert.alert('Gagal memperbarui foto', 'Periksa koneksi internet lalu coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const toggleBiometric = async () => {
    if (!prefs) return;
    if (!prefs.biometric) {
      const info = biometric ?? (await getBiometricSupport());
      if (!info.usable) {
        Alert.alert('Biometrik tidak tersedia', info.reason ?? 'Perangkat ini tidak mendukung biometrik.', [{ text: 'Mengerti' }]);
        return;
      }
      const ok = await authenticateBiometric(info.kindName);
      if (!ok) {
        Alert.alert('Belum diaktifkan', `Verifikasi ${info.kindName} tidak berhasil, jadi biometrik tidak diaktifkan.`, [{ text: 'Mengerti' }]);
        return;
      }
    }
    const next = await savePreferences({ biometric: !prefs.biometric });
    setPrefs(next);
  };

  const logout = async () => {
    try {
      await signOut(await getFirebaseAuth());
      router.replace('/(auth)/login');
    } catch {
      Alert.alert('Tidak dapat keluar', 'Coba lagi.');
    }
  };

  const accountItems: MenuItem[] = [
    { kind: 'link', key: 'data-pribadi', icon: 'account-outline', label: 'Data pribadi', description: 'Nama, nomor telepon, dan email.', onPress: () => router.push('/(app)/data-pribadi') },
    { kind: 'link', key: 'pesanan', icon: 'package-variant-closed', label: 'Pesanan saya', description: 'Daftar pesanan hasil tani Anda.', onPress: () => router.push('/(app)/pesanan') },
    { kind: 'link', key: 'alamat', icon: 'map-marker-radius-outline', label: 'Alamat pengiriman', description: 'Alamat usaha untuk pengiriman.', onPress: () => router.push('/(app)/alamat-pengiriman') },
  ];

  const preferenceItems: MenuItem[] = [
    { kind: 'link', key: 'pengaturan', icon: 'tune-variant', label: 'Pengaturan', description: 'Notifikasi dan info aplikasi.', onPress: () => router.push('/(app)/pengaturan') },
    {
      kind: 'switch',
      key: 'darkmode',
      icon: 'weather-night',
      label: 'Darkmode',
      description: 'Mengubah tampilan aplikasi menjadi tema gelap.',
      value: dark,
      onValueChange: setDark,
    },
    {
      kind: 'switch',
      key: 'biometric',
      icon: 'fingerprint',
      label: 'Biometrik',
      description: biometric?.usable
        ? `Kunci aplikasi dengan ${biometric.kindName} saat dibuka.`
        : (biometric?.reason ?? 'Kunci aplikasi dengan sidik jari atau wajah.'),
      value: Boolean(prefs?.biometric),
      onValueChange: () => void toggleBiometric(),
    },
  ];

  const learnItems: MenuItem[] = [
    { kind: 'link', key: 'academy', icon: 'school-outline', label: 'Avasthani Academy', description: 'Materi pemupukan dan budidaya.', onPress: () => router.push('/(app)/academy') },
    { kind: 'link', key: 'kamus', icon: 'book-open-variant', label: 'Kamus Tani', description: 'Istilah pertanian dan artinya.', onPress: () => router.push('/(app)/kamus-tani') },
  ];

  const dangerItems: MenuItem[] = [
    { kind: 'link', key: 'logout', icon: 'logout-variant', label: 'Keluar', description: 'Keluar dari akun ini di perangkat ini.', tone: 'danger', onPress: () => void logout() },
  ];

  return (
    <Page bottomPadding={112}>
      <View style={s.header}>
        <Avatar uri={photoURL} name={displayName} editable busy={uploading} onPress={() => void changeAvatar()} />
        <View style={s.headerCopy}>
          <Text numberOfLines={2} style={s.name}>{displayName || 'Pengguna Avasthani'}</Text>
          <Text numberOfLines={1} style={s.email}>{user?.email ?? 'Email belum tersedia'}</Text>
        </View>
      </View>
      <Text style={s.tapHint}>Ketuk foto untuk mengganti. Maksimal 2 MB.</Text>

      {setupNeeded ? (
        <View style={s.notice}>
          <Notice>Profil usaha belum dilengkapi. Anda tetap dapat menggunakan menu Home dan Produk.</Notice>
          <Link href="/(app)/(tabs)/complete-profile" style={s.primaryLink}>Lengkapi profil usaha →</Link>
        </View>
      ) : (
        <View style={s.businessCard}>
          <View style={s.businessRow}>
            <Text style={s.businessLabel}>USAHA</Text>
            <Text style={[s.status, verification === 'VERIFIED' ? s.verified : verification === 'REJECTED' ? s.danger : s.pending]}>
              {verification === 'VERIFIED' ? 'Terverifikasi' : verification === 'REJECTED' ? 'Perlu hubungi dukungan' : 'Menunggu verifikasi'}
            </Text>
          </View>
          <Text numberOfLines={1} style={s.businessName}>{account.business?.name}</Text>
          <Text numberOfLines={2} style={s.businessAddress}>
            {account.business?.address.addressLine ? `${account.business.address.addressLine}, ` : ''}
            {account.business?.address.city}
          </Text>
        </View>
      )}

      {account.role === 'SUPER_ADMIN' ? <Link href="/(app)/operator" style={s.adminLink}>Buka menu admin →</Link> : null}

      <MenuGroup title="AKUN" items={accountItems} />
      <MenuGroup title="PREFERENSI" items={preferenceItems} />
      <MenuGroup title="BELAJAR" items={learnItems} />
      <MenuGroup items={dangerItems} />
    </Page>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  header: { alignItems: 'center', gap: 12, paddingTop: 4 },
  headerCopy: { alignItems: 'center', gap: 3 },
  name: { color: c.textPrimary, fontSize: 19, fontWeight: '800', textAlign: 'center' },
  email: { color: c.textSecondary, fontSize: 13, maxWidth: 260 },
  tapHint: { color: c.textSecondary, fontSize: 11, textAlign: 'center', marginTop: 8, marginBottom: 18 },
  notice: { marginBottom: 14 },
  businessCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 15, marginBottom: 16 },
  businessRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 7 },
  businessLabel: { color: c.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  businessName: { color: c.textPrimary, fontSize: 15, fontWeight: '800' },
  businessAddress: { color: c.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 2 },
  status: { fontSize: 11, fontWeight: '800' },
  verified: { color: c.success },
  pending: { color: c.warning },
  danger: { color: c.danger },
  adminLink: { color: c.primary, fontWeight: '800', paddingVertical: 12, marginBottom: 4 },
  primaryLink: { color: c.primary, fontWeight: '800', paddingVertical: 8 },
});
