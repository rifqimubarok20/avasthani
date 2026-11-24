import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Link } from 'expo-router';
import { Notice, Page, Title } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { listSupplierProducts } from '@/features/catalog/service';
import type { Product } from '@/types';

export default function SupplierProducts() {
  const { account, user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => { if (!account.business || !user) return; setError(''); try { setItems(await listSupplierProducts(account.business.id, user.uid)); } catch (e) { console.error('Produk pemasok gagal dimuat', e); setError('Daftar produk belum dapat dimuat.'); } finally { setLoading(false); } }, [account.business, user]);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);
  return <Page><Title title="Produk saya" subtitle="Kelola pengajuan dan pantau hasil peninjauan." /><Link href="/(app)/supplier/products/create" asChild><Pressable style={s.add}><Text style={s.addText}>＋ Tambah produk</Text></Pressable></Link>{loading ? <ActivityIndicator color="#087E83" /> : error ? <Notice tone="error">{error}</Notice> : items.length === 0 ? <Notice>Belum ada produk. Produk baru akan ditinjau sebelum tampil di katalog.</Notice> : items.map((item) => <View key={item.id} style={s.card}><Text style={s.name}>{item.name}</Text><Text style={s.detail}>{item.indicativeStock === undefined ? 'Stok belum dicantumkan' : `Stok indikatif ±${item.indicativeStock} ${item.baseUnit}`}</Text><Text style={[s.status, item.reviewStatus === 'APPROVED' ? s.approved : item.reviewStatus === 'REJECTED' ? s.rejected : s.pending]}>{item.reviewStatus === 'APPROVED' ? 'Disetujui · tampil di katalog' : item.reviewStatus === 'REJECTED' ? 'Perlu diperbaiki' : 'Menunggu moderasi'}</Text>{item.reviewNote ? <Text style={s.note}>Catatan: {item.reviewNote}</Text> : null}{item.reviewStatus === 'REJECTED' ? <Link href="/(app)/supplier/products/create" style={s.edit}>Ajukan produk yang diperbaiki</Link> : null}</View>)}<Link href="/(app)/catalog" style={s.link}>Lihat katalog produk</Link></Page>;
}
const s = StyleSheet.create({ add: { borderRadius: 13, padding: 15, alignItems: 'center', backgroundColor: '#087E83', marginBottom: 18 }, addText: { color: '#fff', fontSize: 15, fontWeight: '800' }, card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#DCE4DD', borderRadius: 15, padding: 16, gap: 7, marginBottom: 12 }, name: { color: '#202923', fontSize: 18, fontWeight: '800' }, detail: { color: '#66736A', fontSize: 14 }, status: { fontWeight: '700', marginTop: 4 }, approved: { color: '#087E83' }, rejected: { color: '#A93C39' }, pending: { color: '#9A6A12' }, note: { color: '#A93C39', lineHeight: 20 }, edit: { color: '#087E83', fontWeight: '700', marginTop: 6 }, link: { color: '#087E83', fontWeight: '700', textAlign: 'center', marginTop: 12 } });
