import { useCallback, useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { collection, doc, getDocs, query, serverTimestamp, where, writeBatch } from '@react-native-firebase/firestore';
import { signOut } from '@react-native-firebase/auth';
import { Notice, Page, PrimaryButton, Title } from '@/components/ui';
import { getFirebaseAuth } from '@/services/firebase/auth';
import { getFirebaseFirestore } from '@/services/firebase/firestore';
import type { Business } from '@/types';

export default function OperatorReview() {
  const [pending, setPending] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadPending = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const db = await getFirebaseFirestore();
      const snapshot = await getDocs(query(collection(db, 'businesses'), where('verificationStatus', '==', 'PENDING')));
      setPending(snapshot.docs.map((item) => item.data() as Business));
    } catch (error) {
      console.error('Daftar verifikasi gagal dimuat', error);
      Alert.alert('Tidak dapat memuat data', 'Periksa koneksi dan pastikan akun admin sudah aktif.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void loadPending(false); }, 0);
    return () => clearTimeout(timer);
  }, [loadPending]);

  const decide = async (business: Business, status: 'VERIFIED' | 'REJECTED') => {
    setBusyId(business.id);
    try {
      const db = await getFirebaseFirestore();
      const batch = writeBatch(db);
      const now = serverTimestamp();
      batch.update(doc(db, 'businesses', business.id), { verificationStatus: status, updatedAt: now });
      batch.update(doc(db, 'users', business.ownerUid), {
        status: status === 'VERIFIED' ? 'ACTIVE' : 'PENDING_VERIFICATION',
        updatedAt: now,
      });
      await batch.commit();
      await loadPending();
      Alert.alert(status === 'VERIFIED' ? 'Verifikasi disetujui' : 'Verifikasi ditolak', `${business.name} telah diperbarui.`);
    } catch (error) {
      console.error('Keputusan verifikasi gagal disimpan', error);
      Alert.alert('Perubahan belum tersimpan', 'Pastikan token admin terbaru sudah aktif, lalu coba kembali.');
    } finally {
      setBusyId(null);
    }
  };

  const confirmDecision = (business: Business, status: 'VERIFIED' | 'REJECTED') => {
    const approved = status === 'VERIFIED';
    Alert.alert(approved ? 'Setujui verifikasi?' : 'Tolak verifikasi?', `${business.name} akan ${approved ? 'ditandai terverifikasi' : 'ditandai perlu perbaikan'}.`, [
      { text: 'Batal', style: 'cancel' },
      { text: approved ? 'Setujui' : 'Tolak', style: approved ? 'default' : 'destructive', onPress: () => void decide(business, status) },
    ]);
  };

  const logout = async () => {
    try { await signOut(await getFirebaseAuth()); }
    catch { Alert.alert('Tidak dapat keluar', 'Coba lagi.'); }
  };

  return (
    <Page>
      <Title title="Tinjau verifikasi" subtitle="Periksa profil usaha sebelum menyetujui akses akun." />
      <Link href="/(app)/operator/products" style={{ color: '#087E83', fontWeight: '800', fontSize: 16, marginBottom: 18 }}>Moderasi produk →</Link>
      <Pressable accessibilityRole="button" onPress={() => void loadPending()} style={styles.refresh}>
        <Text style={styles.refreshText}>Muat ulang daftar</Text>
      </Pressable>
      {loading ? <ActivityIndicator color="#087E83" style={styles.loading} /> : pending.length === 0 ? (
        <Notice tone="success">Tidak ada profil usaha yang menunggu verifikasi.</Notice>
      ) : pending.map((business) => (
        <View key={business.id} style={styles.card}>
          <Text style={styles.businessName}>{business.name}</Text>
          <Text style={styles.detail}>{business.address.city}, {business.address.province}</Text>
          <Text style={styles.detail}>Telepon: {business.phone ?? '—'}</Text>
          <Text style={styles.detail}>Jenis usaha: {business.type === 'BUYER' ? 'Pembeli' : business.type === 'SUPPLIER' ? 'Petani / pemasok' : 'Gabungan'}</Text>
          <View style={styles.actions}>
            <Pressable accessibilityRole="button" disabled={busyId === business.id} onPress={() => confirmDecision(business, 'REJECTED')} style={[styles.reject, busyId === business.id && styles.disabled]}>
              <Text style={styles.rejectText}>{busyId === business.id ? 'Memproses…' : 'Tolak'}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={busyId === business.id} onPress={() => confirmDecision(business, 'VERIFIED')} style={[styles.approve, busyId === business.id && styles.disabled]}>
              <Text style={styles.approveText}>{busyId === business.id ? 'Memproses…' : 'Setujui'}</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <PrimaryButton title="Keluar dari akun admin" onPress={() => void logout()} />
    </Page>
  );
}

const styles = StyleSheet.create({
  refresh: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 2, marginBottom: 12 },
  refreshText: { color: '#087E83', fontWeight: '700', fontSize: 14 },
  loading: { marginTop: 28 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE4DD', borderRadius: 16, padding: 18, marginBottom: 14, gap: 7 },
  businessName: { color: '#202923', fontSize: 19, fontWeight: '800', marginBottom: 2 },
  detail: { color: '#66736A', fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  reject: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: '#D96B68', alignItems: 'center', justifyContent: 'center' },
  rejectText: { color: '#A93C39', fontWeight: '700' },
  approve: { flex: 1, minHeight: 46, borderRadius: 12, backgroundColor: '#087E83', alignItems: 'center', justifyContent: 'center' },
  approveText: { color: '#FFFFFF', fontWeight: '700' },
  disabled: { opacity: 0.55 },
});
