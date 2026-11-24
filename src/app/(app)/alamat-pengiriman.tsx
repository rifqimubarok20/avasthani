import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Text, TextInput } from '@/components/AppText';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Field, Notice, Page, PrimaryButton } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { updateBusinessAddress } from '@/services/profile';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';
import type { Business, BusinessAddress } from '@/types';

export default function AlamatPengirimanScreen() {
  const { account } = useAuth();
  const business = account.business;
  const c = useColors();
  const s = styles(c);

  // Form dipisah agar nilai awal diambil betul-betul sekali saja saat komponen
  // dipasang; tidak ada pembaruan realtime yang menimpa teks yang diketik.
  if (!business) {
    return (
      <Page>
        <ScreenHeader kicker="AKUN" title="Alamat pengiriman" />
        <Notice>Alamat mengikuti data usaha. Lengkapi profil usaha terlebih dahulu untuk mengatur alamat pengiriman.</Notice>
        <Link href="/(app)/(tabs)/complete-profile" style={s.link}>Lengkapi profil usaha →</Link>
      </Page>
    );
  }

  return <AddressForm key={business.id} business={business} />;
}

function AddressForm({ business }: { business: Business }) {
  const c = useColors();
  const s = styles(c);
  const [address, setAddress] = useState<BusinessAddress>({ ...business.address });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const dirty = useMemo(() => {
    const original = business.address;
    return address.province !== original.province
      || address.city !== original.city
      || (address.district ?? '') !== (original.district ?? '')
      || (address.village ?? '') !== (original.village ?? '')
      || (address.addressLine ?? '') !== (original.addressLine ?? '');
  }, [business, address]);

  const save = async () => {
    setError('');
    if (address.province.trim().length < 2) { setError('Provinsi wajib diisi.'); return; }
    if (address.city.trim().length < 2) { setError('Kota / kabupaten wajib diisi.'); return; }
    if ((address.addressLine ?? '').trim().length < 5) { setError('Alamat lengkap minimal 5 karakter.'); return; }
    setBusy(true);
    try {
      await updateBusinessAddress(business.id, {
        province: address.province.trim(),
        city: address.city.trim(),
        district: address.district?.trim() || undefined,
        village: address.village?.trim() || undefined,
        addressLine: address.addressLine?.trim() ?? '',
      });
      Alert.alert('Tersimpan', 'Alamat pengiriman berhasil diperbarui.', [{ text: 'Mengerti', onPress: () => router.back() }]);
    } catch (e) {
      console.error('Simpan alamat gagal', e);
      setError('Perubahan belum tersimpan. Pastikan Anda pemilik atau anggota usaha ini.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <ScreenHeader kicker="AKUN" title="Alamat pengiriman" subtitle="Dipakai untuk pengiriman hasil tani dan surat-menyurat usaha." />
      <View style={s.card}>
        <Field label="Provinsi" value={address.province} onChangeText={(v) => setAddress({ ...address, province: v })} placeholder="Contoh: Jawa Barat" accessibilityLabel="Provinsi" />
        <Field label="Kota / kabupaten" value={address.city} onChangeText={(v) => setAddress({ ...address, city: v })} placeholder="Contoh: Garut" accessibilityLabel="Kota atau kabupaten" />
        <Field label="Kecamatan (opsional)" value={address.district ?? ''} onChangeText={(v) => setAddress({ ...address, district: v })} placeholder="Contoh: Karawang" accessibilityLabel="Kecamatan" />
        <Field label="Desa / kelurahan (opsional)" value={address.village ?? ''} onChangeText={(v) => setAddress({ ...address, village: v })} placeholder="Contoh: Pasirjati" accessibilityLabel="Desa atau kelurahan" />
        <View style={s.block}>
          <Text style={s.label}>Alamat lengkap</Text>
          <TextInput value={address.addressLine ?? ''} onChangeText={(v) => setAddress({ ...address, addressLine: v })} placeholder="Nama jalan, nomor rumah, RT/RW" multiline accessibilityLabel="Alamat lengkap" style={s.textarea} />
        </View>
      </View>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <PrimaryButton title="Simpan alamat" onPress={() => void save()} busy={busy} disabled={!dirty} />
      {!dirty && !busy ? <Text style={s.hint}>Belum ada perubahan untuk disimpan.</Text> : null}
    </Page>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 16, gap: 2, marginBottom: 16 },
  block: { marginBottom: 14, gap: 7 },
  label: { color: c.textPrimary, fontSize: 14, fontWeight: '600' },
  textarea: { minHeight: 90, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: c.textPrimary, fontSize: 15, textAlignVertical: 'top' },
  hint: { color: c.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 10 },
  link: { color: c.primary, fontWeight: '800', paddingVertical: 10 },
});
