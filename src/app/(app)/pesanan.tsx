import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/components/AppText';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Notice, Page } from '@/components/ui';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export default function PesananSayaScreen() {
  const c = useColors();
  const s = styles(c);
  return (
    <Page>
      <ScreenHeader kicker="AKUN" title="Pesanan saya" subtitle="Status pesanan hasil tani Anda terkumpul di sini." />
      <View style={s.emptyCard}>
        <Text style={s.glyph}>📦</Text>
        <Text style={s.title}>Belum ada pesanan</Text>
        <Text style={s.copy}>
          Fitur pemesanan belum dibuka di aplikasi ini. Begitu pesanan pertama Anda
          dibuat, daftar dan statusnya akan tampil di halaman ini.
        </Text>
      </View>
      <Notice>Sementara ini Anda dapat memesan hasil tani melalui tim Avasthani sesuai model perdagangan B2B.</Notice>
      <Link href="/(app)/(tabs)/products" style={s.link}>Lihat katalog produk ›</Link>
    </Page>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  emptyCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 26, alignItems: 'center', gap: 7, marginBottom: 16 },
  glyph: { fontSize: 40, marginBottom: 2 },
  title: { color: c.textPrimary, fontSize: 16, fontWeight: '800' },
  copy: { color: c.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  link: { color: c.primary, fontWeight: '800', paddingVertical: 10 },
});
