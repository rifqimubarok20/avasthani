import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '@/components/AppText';
import { Link } from 'expo-router';
import { Notice, Page, Title } from '@/components/ui';
import { listApprovedProducts, listCategories } from '@/features/catalog/service';
import type { Category, Product } from '@/types';

export default function CatalogScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setError('');
    try { const [items, groups] = await Promise.all([listApprovedProducts(), listCategories()]); setProducts(items); setCategories(groups); }
    catch (e) { console.error('Katalog gagal dimuat', e); setError('Katalog belum dapat dimuat. Periksa koneksi lalu coba lagi.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);
  const filtered = useMemo(() => products.filter((item) => (!categoryId || item.categoryId === categoryId) && item.name.toLocaleLowerCase('id').includes(search.trim().toLocaleLowerCase('id'))), [products, categoryId, search]);
  return <Page bottomPadding={112}><Title title="Katalog produk" subtitle="Produk dari pemasok yang telah ditinjau. Stok dan harga bersifat indikatif." />
    <TextInput accessibilityLabel="Cari produk" placeholder="Cari produk…" placeholderTextColor="#73837A" value={search} onChangeText={setSearch} style={s.search} />
    <View style={s.chips}><FilterChip label="Semua" selected={!categoryId} onPress={() => setCategoryId('')} />{categories.map((item) => <FilterChip key={item.id} label={item.name} selected={categoryId === item.id} onPress={() => setCategoryId(item.id)} />)}</View>
    {loading ? <ActivityIndicator color="#087E83" style={{ marginTop: 30 }} /> : error ? <Notice tone="error">{error}</Notice> : filtered.length === 0 ? <Notice>Belum ada produk pada pilihan ini.</Notice> : <View style={s.grid}>{filtered.map((item) => <Link key={item.id} href={{ pathname: '/(app)/catalog/[productId]', params: { productId: item.id } }} asChild><Pressable style={s.card}>{item.images[0] ? <Image source={{ uri: item.images[0] }} style={s.image} /> : <View style={[s.image, s.imageBlank]}><Text style={s.emoji}>🌿</Text></View>}<Text style={s.name}>{item.name}</Text><Text style={s.muted}>{categories.find((c) => c.id === item.categoryId)?.name ?? 'Produk'} · {item.location.city}</Text><Text style={s.price}>{item.indicativePricePerUnit === undefined ? 'Harga dapat ditanyakan' : `Rp${item.indicativePricePerUnit.toLocaleString('id-ID')} / ${item.baseUnit}`}</Text><Text style={s.stock}>{item.indicativeStock === undefined ? 'Stok perlu dikonfirmasi' : `± ${item.indicativeStock.toLocaleString('id-ID')} ${item.baseUnit} tersedia`}</Text></Pressable></Link>)}</View>}
    {!loading && <Pressable accessibilityRole="button" onPress={() => void load()} style={s.refresh}><Text style={s.refreshText}>Muat ulang katalog</Text></Pressable>}
  </Page>;
}
function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) { return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[s.chip, selected && s.chipSelected]}><Text style={[s.chipText, selected && s.chipTextSelected]}>{label}</Text></Pressable>; }
const s = StyleSheet.create({ search: { height: 50, borderRadius: 15, borderWidth: 1, borderColor: '#DCE4DD', backgroundColor: '#fff', paddingHorizontal: 15, color: '#202923', marginBottom: 14 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }, chip: { paddingHorizontal: 13, paddingVertical: 9, borderWidth: 1, borderColor: '#DCE4DD', borderRadius: 20, backgroundColor: '#fff' }, chipSelected: { borderColor: '#087E83', backgroundColor: '#E5F3EE' }, chipText: { color: '#52645A', fontSize: 13 }, chipTextSelected: { color: '#087E83', fontWeight: '700' }, grid: { gap: 14 }, card: { overflow: 'hidden', borderRadius: 16, borderColor: '#DCE4DD', borderWidth: 1, backgroundColor: '#fff', paddingBottom: 14 }, image: { width: '100%', height: 185, backgroundColor: '#E7F2EC' }, imageBlank: { alignItems: 'center', justifyContent: 'center' }, emoji: { fontSize: 46 }, name: { color: '#202923', fontWeight: '800', fontSize: 18, marginHorizontal: 14, marginTop: 12 }, muted: { color: '#66736A', fontSize: 13, marginHorizontal: 14, marginTop: 4 }, price: { color: '#087E83', fontSize: 15, fontWeight: '700', marginHorizontal: 14, marginTop: 10 }, stock: { color: '#66736A', fontSize: 13, marginHorizontal: 14, marginTop: 5 }, refresh: { padding: 14, alignItems: 'center' }, refreshText: { color: '#087E83', fontWeight: '700' } });
