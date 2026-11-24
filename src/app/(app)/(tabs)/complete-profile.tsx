import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Text } from '@/components/AppText';
import { Choice, Field, Page, PrimaryButton, Title } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { businessProfileSchema } from '@/schemas';
import { createBusinessProfile } from '@/services/profile';
import { useColors } from '@/theme/ThemeProvider';

export default function ProfileOnboarding() {
  const c = useColors();
  const { user, refresh } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? ''); const [businessName, setBusinessName] = useState(''); const [role, setRole] = useState<'BUYER' | 'SUPPLIER'>('BUYER'); const [phoneNumber, setPhoneNumber] = useState(''); const [province, setProvince] = useState('Jawa Barat'); const [city, setCity] = useState(''); const [district, setDistrict] = useState(''); const [addressLine, setAddressLine] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!user) return;
    const parsed = businessProfileSchema.safeParse({ displayName, businessName, role, phoneNumber, province, city, district, addressLine });
    if (!parsed.success) return Alert.alert('Periksa kembali', parsed.error.issues[0]?.message);
    setBusy(true);
    try { await createBusinessProfile(user, parsed.data); await refresh(); router.replace('/(app)/(tabs)/profile'); }
    catch (error) {
      console.error('Profil Firestore gagal disimpan', error);
      const code = (error as { code?: string })?.code;
      const message = code === 'profile/write-timeout'
        ? 'Server belum memberi konfirmasi setelah 20 detik. Data mungkin masih diproses. Periksa koneksi internet dan buka kembali aplikasi sebelum mencoba mengirim ulang.'
        : code === 'firestore/permission-denied'
          ? 'Firebase menolak penyimpanan profil. Pastikan Firestore Rules terbaru sudah dipublikasikan untuk project ini.'
          : code === 'firestore/unavailable' || code === 'firestore/network-request-failed'
            ? 'Firestore tidak dapat dijangkau. Periksa koneksi internet emulator, lalu coba lagi.'
            : 'Periksa koneksi internet dan konfigurasi Firebase, lalu coba lagi.';
      Alert.alert('Belum dapat menyimpan profil', message);
    }
    finally { setBusy(false); }
  };
  return <Page><Title title="Profil pengguna & usaha" subtitle="Lengkapi data agar tim Avasthani dapat memverifikasi akun Anda." /><Field label="Nama lengkap" value={displayName} onChangeText={setDisplayName} autoComplete="name" /><Text style={{ color: c.textPrimary, fontWeight: '700', marginBottom: 10 }}>Saya menggunakan Avasthani sebagai</Text><Choice title="Pembeli" description="Usaha yang membutuhkan hasil pertanian." selected={role === 'BUYER'} onPress={() => setRole('BUYER')} /><Choice title="Petani / pemasok" description="Usaha yang menyediakan hasil pertanian." selected={role === 'SUPPLIER'} onPress={() => setRole('SUPPLIER')} /><Field label="Nama usaha" value={businessName} onChangeText={setBusinessName} /><Field label="Nomor telepon usaha" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" autoComplete="tel" /><Field label="Provinsi" value={province} onChangeText={setProvince} /><Field label="Kabupaten / kota" value={city} onChangeText={setCity} /><Field label="Kecamatan (opsional)" value={district} onChangeText={setDistrict} /><Field label="Alamat usaha" value={addressLine} onChangeText={setAddressLine} multiline numberOfLines={3} textAlignVertical="top" /><PrimaryButton title="Kirim untuk verifikasi" onPress={() => void submit()} busy={busy} /></Page>;
}
