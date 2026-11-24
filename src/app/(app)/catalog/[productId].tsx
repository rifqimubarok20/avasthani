import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Link, useLocalSearchParams } from 'expo-router';
import { Notice, Page, Title } from '@/components/ui';
import { getProduct, listCategories } from '@/features/catalog/service';
import type { Category, Product } from '@/types';

export default function ProductDetail() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; void Promise.all([getProduct(productId), listCategories()]).then(([item, groups]) => { if (active) { setProduct(item); setCategories(groups); } }).catch((error) => console.error('Detail produk gagal dimuat', error)).finally(() => active && setLoading(false)); return () => { active = false; }; }, [productId]);
  if (loading) return <Page><ActivityIndicator color="#087E83" /></Page>;
  if (!product) return <Page><Title title="Produk tidak tersedia" /><Notice>Produk mungkin telah dihapus atau belum dipublikasikan.</Notice><Link href="/(app)/catalog">Kembali ke katalog</Link></Page>;
  return <Page>{product.images[0] ? <Image source={{ uri: product.images[0] }} style={s.image} /> : null}<Title title={product.name} subtitle={`${categories.find((c) => c.id === product.categoryId)?.name ?? 'Produk'} · ${product.location.city}${product.location.district ? `, ${product.location.district}` : ''}`} /><View style={s.info}><Text style={s.price}>{product.indicativePricePerUnit === undefined ? 'Harga dikonfirmasi saat pemesanan' : `Rp${product.indicativePricePerUnit.toLocaleString('id-ID')} / ${product.baseUnit}`}</Text><Text style={s.line}>Stok indikatif: {product.indicativeStock === undefined ? 'belum dicantumkan' : `${product.indicativeStock.toLocaleString('id-ID')} ${product.baseUnit}`}</Text><Text style={s.line}>Ketersediaan: {product.availabilityStatus === 'AVAILABLE' ? 'Tersedia' : product.availabilityStatus === 'LIMITED' ? 'Terbatas' : 'Tidak tersedia'}</Text>{product.grade ? <Text style={s.line}>Kualitas: {product.grade}</Text> : null}</View>{product.description ? <Text style={s.description}>{product.description}</Text> : null}<Notice>Stok dan harga adalah indikasi awal dan perlu dikonfirmasi dengan pemasok.</Notice><Link href="/(app)/catalog" style={s.back}>Kembali ke katalog</Link></Page>;
}
const s = StyleSheet.create({ image: { width: '100%', height: 250, borderRadius: 18, marginBottom: 20, backgroundColor: '#E7F2EC' }, info: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#DCE4DD', backgroundColor: '#fff', gap: 9, marginBottom: 15 }, price: { color: '#087E83', fontWeight: '800', fontSize: 20 }, line: { color: '#52645A', fontSize: 15 }, description: { color: '#202923', lineHeight: 23, marginBottom: 16 }, back: { color: '#087E83', fontWeight: '700', marginTop: 2 } });
