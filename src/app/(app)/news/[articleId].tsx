import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Page } from '@/components/ui';
import { formatNewsDate, NEWS_ARTICLES } from '@/features/news/data';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export default function NewsArticleScreen() {
  const c = useColors();
  const s = styles(c);
  const { articleId } = useLocalSearchParams<{ articleId: string }>();
  const article = NEWS_ARTICLES.find((item) => item.id === articleId);

  if (!article) return <Page>
    <Link href="/(app)/news" style={s.back}>‹  Kembali ke berita</Link>
    <Text style={s.title}>Artikel tidak ditemukan</Text>
    <Text style={s.summary}>Artikel mungkin sudah tidak tersedia.</Text>
  </Page>;

  return <Page>
    <Link href="/(app)/news" style={s.back}>‹  Kembali ke berita</Link>
    <View style={[s.artwork, { backgroundColor: article.tint }]}><Text style={s.glyph}>{article.glyph}</Text></View>
    <Text style={s.category}>{article.category.toUpperCase()} · WAWASAN AVASTHANI</Text>
    <Text style={s.title}>{article.title}</Text>
    <Text style={s.date}>{formatNewsDate(article.publishedAt)} · {article.readMinutes} menit baca</Text>
    <View style={s.rule} />
    <Text style={s.summary}>{article.summary}</Text>
    <Text style={s.body}>Informasi ini merupakan wawasan umum. Sesuaikan praktik pertanian dengan jenis tanaman, kondisi lahan, serta rekomendasi penyuluh atau tenaga ahli setempat.</Text>
    <Text style={s.note}>Konten contoh editorial Avasthani, bukan berita dari penerbit eksternal.</Text>
  </Page>;
}

const styles = (c: Palette) => StyleSheet.create({
  back: { color: c.primary, fontSize: 14, fontWeight: '800', marginBottom: 18 },
  artwork: { height: 190, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }, glyph: { fontSize: 72 },
  category: { color: c.primary, fontSize: 10, letterSpacing: 1, fontWeight: '800', marginBottom: 8 },
  title: { color: c.textPrimary, fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.5 },
  date: { color: c.textSecondary, fontSize: 12, marginTop: 10 }, rule: { height: 1, backgroundColor: c.border, marginVertical: 20 },
  summary: { color: c.textPrimary, fontSize: 16, lineHeight: 25, fontWeight: '600' }, body: { color: c.textSecondary, fontSize: 14, lineHeight: 22, marginTop: 14 },
  note: { color: c.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 24 },
});
