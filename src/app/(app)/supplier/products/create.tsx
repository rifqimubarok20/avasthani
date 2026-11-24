import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Field, Notice, Page, PrimaryButton, Title } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { listCategories, listUnits, submitProduct } from '@/features/catalog/service';
import { productSchema, type ProductInput } from '@/schemas';
import type { Category, Unit } from '@/types';

const availability = [{ value: 'AVAILABLE', label: 'Tersedia' }, { value: 'LIMITED', label: 'Terbatas' }, { value: 'UNAVAILABLE', label: 'Tidak tersedia' }] as const;
export default function CreateProduct() {
  const { user, account } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [values, setValues] = useState({ name: '', categoryId: '', description: '', baseUnit: '', grade: '', indicativeStock: '', indicativePricePerUnit: '', availabilityStatus: 'AVAILABLE', city: account.business?.address.city ?? '', district: account.business?.address.district ?? '' });
  const [imageUri, setImageUri] = useState('');
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { let active = true; void Promise.all([listCategories(), listUnits()]).then(([c, u]) => { if (!active) return; setCategories(c); setUnits(u); setValues((v) => ({ ...v, categoryId: v.categoryId || c[0]?.id || '', baseUnit: v.baseUnit || u[0]?.id || '' })); }).catch((e) => { console.error('Pilihan kategori tidak dimuat', e); setError('Kategori dan satuan gagal dimuat. Coba muat ulang aplikasi.'); }); return () => { active = false; }; }, []);
  const set = (key: keyof typeof values, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const choosePhoto = async () => { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.82 }); if (!result.canceled && result.assets[0]) { setImageUri(result.assets[0].uri); setImageMimeType(result.assets[0].mimeType ?? null); } };
  const save = async () => {
    setError('');
    if (!user || !account.business || account.role !== 'SUPPLIER') { setError('Akun pemasok terverifikasi diperlukan untuk mengajukan produk.'); return; }
    if (!imageUri) { setError('Pilih foto produk terlebih dahulu.'); return; }
    const parsed = productSchema.safeParse(values);
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Periksa kembali data produk.'); return; }
    setBusy(true);
    try { await submitProduct(parsed.data as ProductInput, { uid: user.uid, businessId: account.business.id }, { uri: imageUri, mimeType: imageMimeType }); Alert.alert('Pengajuan terkirim', 'Produk akan tampil di katalog setelah disetujui moderator.', [{ text: 'Mengerti', onPress: () => router.replace('/(app)/supplier/products') }]); }
    catch (e) { console.error('Pengajuan produk gagal', e); setError('Produk belum terkirim. Pastikan profil usaha terverifikasi, lalu coba lagi.'); }
    finally { setBusy(false); }
  };
  return <Page><Title title="Ajukan produk" subtitle="Lengkapi informasi produk. Foto akan diunggah dan pengajuan ditinjau sebelum tampil." />{error ? <Notice tone="error">{error}</Notice> : null}<Field label="Nama produk" placeholder="Contoh: Cabai merah keriting" value={values.name} onChangeText={(v) => set('name', v)} /><Text style={s.label}>Kategori</Text><Choices options={categories.map((x) => ({ value: x.id, label: x.name }))} selected={values.categoryId} onSelect={(v) => set('categoryId', v)} /><Field label="Deskripsi (opsional)" placeholder="Keterangan produk" value={values.description} onChangeText={(v) => set('description', v)} multiline /><Text style={s.label}>Satuan dasar</Text><Choices options={units.map((x) => ({ value: x.id, label: x.name }))} selected={values.baseUnit} onSelect={(v) => set('baseUnit', v)} /><Field label="Kualitas / grade (opsional)" placeholder="Contoh: Grade A" value={values.grade} onChangeText={(v) => set('grade', v)} /><Field label="Stok indikatif (opsional)" placeholder="Perkiraan jumlah" keyboardType="decimal-pad" value={values.indicativeStock} onChangeText={(v) => set('indicativeStock', v)} /><Field label="Harga indikatif per satuan (opsional)" placeholder="Rupiah" keyboardType="decimal-pad" value={values.indicativePricePerUnit} onChangeText={(v) => set('indicativePricePerUnit', v)} /><Text style={s.label}>Ketersediaan</Text><Choices options={availability.map((x) => ({ value: x.value, label: x.label }))} selected={values.availabilityStatus} onSelect={(v) => set('availabilityStatus', v)} /><Field label="Kota / kabupaten" value={values.city} onChangeText={(v) => set('city', v)} /><Field label="Kecamatan (opsional)" value={values.district} onChangeText={(v) => set('district', v)} /><Text style={s.label}>Foto produk</Text>{imageUri ? <Image source={{ uri: imageUri }} style={s.photo} /> : null}<Pressable accessibilityRole="button" onPress={() => void choosePhoto()} style={s.photoButton}><Text style={s.photoText}>{imageUri ? 'Ganti foto' : 'Pilih foto dari galeri'}</Text></Pressable><Notice>Stok dan harga hanya indikasi dan perlu dikonfirmasi. Foto maksimal 5 MB.</Notice><PrimaryButton title="Kirim untuk ditinjau" onPress={() => void save()} busy={busy} /></Page>;
}
function Choices({ options, selected, onSelect }: { options: { value: string; label: string }[]; selected: string; onSelect: (value: string) => void }) { return <View style={s.choices}>{options.map((item) => <Pressable key={item.value} accessibilityRole="radio" accessibilityState={{ selected: selected === item.value }} onPress={() => onSelect(item.value)} style={[s.choice, selected === item.value && s.choiceActive]}><Text style={[s.choiceText, selected === item.value && s.choiceTextActive]}>{item.label}</Text></Pressable>)}</View>; }
const s = StyleSheet.create({ label: { color: '#202923', fontSize: 14, fontWeight: '700', marginBottom: 8 }, choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }, choice: { borderWidth: 1, borderColor: '#DCE4DD', backgroundColor: '#fff', borderRadius: 22, paddingHorizontal: 13, paddingVertical: 10 }, choiceActive: { backgroundColor: '#E5F3EE', borderColor: '#087E83' }, choiceText: { color: '#52645A', fontWeight: '600' }, choiceTextActive: { color: '#087E83' }, photo: { height: 210, width: '100%', borderRadius: 14, marginBottom: 10 }, photoButton: { borderWidth: 1, borderColor: '#087E83', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 18 }, photoText: { color: '#087E83', fontWeight: '700' } });
