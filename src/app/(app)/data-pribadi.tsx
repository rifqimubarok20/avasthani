import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from '@/components/AppText';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Field, Notice, Page, PrimaryButton } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { updateUserProfile } from '@/services/profile';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export default function DataPribadiScreen() {
  const { user, account } = useAuth();
  const profile = account.profile;
  const c = useColors();
  const s = styles(c);
  const [name, setName] = useState(profile?.displayName ?? user?.displayName ?? '');
  const [phone, setPhone] = useState(profile?.phoneNumber ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const validName = name.trim().length >= 2 && name.trim().length <= 60;
  const validPhone = phone.trim().length === 0 || /^[0-9+\-\s]{6,20}$/.test(phone.trim());
  const dirty = name !== (profile?.displayName ?? '') || phone !== (profile?.phoneNumber ?? '');

  const save = async () => {
    setError('');
    if (!user) return;
    if (!validName) { setError('Nama minimal 2 karakter dan maksimal 60 karakter.'); return; }
    if (!validPhone) { setError('Nomor telepon tidak valid. Gunakan angka dan tanda + atau -.'); return; }
    setBusy(true);
    try {
      await updateUserProfile(user.uid, { displayName: name.trim(), phoneNumber: phone.trim() });
      Alert.alert('Tersimpan', 'Data pribadi berhasil diperbarui.', [{ text: 'Mengerti', onPress: () => router.back() }]);
    } catch (e) {
      console.error('Simpan data pribadi gagal', e);
      setError('Perubahan belum tersimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <ScreenHeader kicker="AKUN" title="Data pribadi" subtitle="Nama ini tampil di seluruh aplikasi dan pada produk Anda." />
      <View style={s.card}>
        <Field label="Nama lengkap" value={name} onChangeText={setName} placeholder="Nama yang ditampilkan" accessibilityLabel="Nama lengkap" />
        <Field label="Nomor telepon" value={phone} onChangeText={setPhone} placeholder="Contoh: 0812xxxxxxx" keyboardType="phone-pad" accessibilityLabel="Nomor telepon" />
        <View style={s.readonly}>
          <Text style={s.readonlyLabel}>Email</Text>
          <Text style={s.readonlyValue}>{user?.email ?? 'Email belum tersedia'}</Text>
          <Text style={s.readonlyHint}>Email mengikuti akun masuk dan tidak diubah dari sini.</Text>
        </View>
      </View>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <PrimaryButton title="Simpan perubahan" onPress={() => void save()} busy={busy} disabled={!dirty} />
      {!dirty && !busy ? <Text style={s.hint}>Belum ada perubahan untuk disimpan.</Text> : null}
    </Page>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 16, gap: 2, marginBottom: 16 },
  readonly: { marginTop: 6, paddingVertical: 8 },
  readonlyLabel: { color: c.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 6 },
  readonlyValue: { color: c.textSecondary, fontSize: 15, fontWeight: '700' },
  readonlyHint: { color: c.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 4 },
  hint: { color: c.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 10 },
});
