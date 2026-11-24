import { useMemo, useState } from 'react';
import { router, Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '@/components/AppText';
import { BackButton } from '@/components/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Page } from '@/components/ui';
import { formatNewsDate, NEWS_ARTICLES, NEWS_REFERENCE_TIME } from '@/features/news/data';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

const timeFilters = ['Semua waktu', '7 hari', '30 hari', 'Lebih lama'] as const;
type TimeFilter = typeof timeFilters[number];

export default function NewsListScreen() {
  const c = useColors();
  const s = styles(c);
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Semua waktu');
  const [newestFirst, setNewestFirst] = useState(true);
  const [filterVisible, setFilterVisible] = useState(false);
  const [draftCategory, setDraftCategory] = useState('Semua');
  const [draftTimeFilter, setDraftTimeFilter] = useState<TimeFilter>('Semua waktu');
  const [draftNewestFirst, setDraftNewestFirst] = useState(true);
  const categories = useMemo(() => ['Semua', ...new Set(NEWS_ARTICLES.map((article) => article.category))], []);
  const activeFilterCount = Number(category !== 'Semua') + Number(timeFilter !== 'Semua waktu') + Number(!newestFirst);

  const articles = useMemo(() => {
    const cutoff = timeFilter === '7 hari' ? 7 : timeFilter === '30 hari' ? 30 : null;
    const tokens = normalizeSearch(query).split(/\s+/).filter(Boolean);
    return NEWS_ARTICLES
      .map((article) => {
        const title = normalizeSearch(article.title);
        const summary = normalizeSearch(article.summary);
        const categoryText = normalizeSearch(article.category);
        const words = `${title} ${summary} ${categoryText}`.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
        const score = tokens.reduce((total, token) => {
          if (title.includes(token)) return total + 4;
          if (categoryText.includes(token)) return total + 3;
          if (summary.includes(token)) return total + 2;
          return words.some((word) => isFuzzyMatch(word, token)) ? total + 1 : total;
        }, 0);
        return { article, score };
      })
      .filter(({ article, score }) => {
        const matchesCategory = category === 'Semua' || article.category === category;
        const ageInDays = (NEWS_REFERENCE_TIME - new Date(article.publishedAt).getTime()) / (24 * 60 * 60 * 1000);
        const matchesTime = timeFilter === 'Semua waktu'
          || (timeFilter === 'Lebih lama' ? ageInDays > 30 : ageInDays <= (cutoff ?? 0));
        return matchesCategory && matchesTime && (tokens.length === 0 || score > 0);
      })
      .sort((a, b) => {
        if (tokens.length && b.score !== a.score) return b.score - a.score;
        return (new Date(a.article.publishedAt).getTime() - new Date(b.article.publishedAt).getTime()) * (newestFirst ? -1 : 1);
      })
      .map(({ article }) => article);
  }, [category, newestFirst, query, timeFilter]);

  const openFilters = () => {
    setDraftCategory(category);
    setDraftTimeFilter(timeFilter);
    setDraftNewestFirst(newestFirst);
    setFilterVisible(true);
  };

  const resetFilters = () => {
    setDraftCategory('Semua');
    setDraftTimeFilter('Semua waktu');
    setDraftNewestFirst(true);
  };

  const applyFilters = () => {
    setCategory(draftCategory);
    setTimeFilter(draftTimeFilter);
    setNewestFirst(draftNewestFirst);
    setFilterVisible(false);
  };

  return <Page bottomPadding={44}>
    <StatusBar style="dark" />
    <View style={s.toolbar}>
      <BackButton onPress={() => router.back()} />
      <View style={s.searchBox}>
        <Text style={s.searchGlyph}>⌕</Text>
        <TextInput
          accessibilityLabel="Cari berita"
          value={query}
          onChangeText={setQuery}
          placeholder="Cari berita…"
          placeholderTextColor="#829188"
          returnKeyType="search"
          style={s.searchInput}
        />
        {query ? <Pressable accessibilityRole="button" accessibilityLabel="Hapus pencarian" onPress={() => setQuery('')}><Text style={s.clearSearch}>×</Text></Pressable> : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Buka filter berita" onPress={openFilters} style={s.filterButton}>
        <FilterGlyph />
        {activeFilterCount > 0 ? <View style={s.filterBadge}><Text style={s.filterBadgeText}>{activeFilterCount}</Text></View> : null}
      </Pressable>
    </View>

    <View style={s.resultsHeader}>
      <Text style={s.resultsTitle}>{query.trim() ? 'Hasil pencarian' : 'Semua berita'}</Text>
      <Text style={s.resultCount}>{articles.length} artikel</Text>
    </View>
    {articles.length ? <View style={s.articleList}>
      {articles.map((article) => <Link key={article.id} href={{ pathname: '/(app)/news/[articleId]', params: { articleId: article.id } }} asChild>
        <Pressable accessibilityRole="button" style={s.articleCard}>
          <View style={[s.articleArtwork, { backgroundColor: article.tint }]}><Text style={s.articleGlyph}>{article.glyph}</Text></View>
          <View style={s.articleCopy}>
            <View style={s.articleMeta}><Text style={s.categoryTag}>{article.category.toUpperCase()}</Text><Text style={s.articleDate}>{formatNewsDate(article.publishedAt)}</Text></View>
            <Text style={s.articleTitle}>{article.title}</Text>
            <Text numberOfLines={2} style={s.articleSummary}>{article.summary}</Text>
            <Text style={s.readMore}>Baca artikel · {article.readMinutes} menit →</Text>
          </View>
        </Pressable>
      </Link>)}
    </View> : <View style={s.emptyState}>
      <Text style={s.emptyGlyph}>⌕</Text>
      <Text style={s.emptyTitle}>Berita tidak ditemukan</Text>
      <Text style={s.emptyCopy}>Coba kata kunci atau ubah filter.</Text>
      <Pressable accessibilityRole="button" onPress={() => { setQuery(''); setCategory('Semua'); setTimeFilter('Semua waktu'); setNewestFirst(true); }}><Text style={s.resetLink}>Hapus pencarian dan filter</Text></Pressable>
    </View>}
    <Text style={s.sampleNote}>Konten wawasan contoh Avasthani.</Text>

    <Modal transparent animationType="slide" visible={filterVisible} onRequestClose={() => setFilterVisible(false)}>
      <View style={s.modalRoot}>
        <Pressable accessibilityRole="button" accessibilityLabel="Tutup filter" style={s.modalBackdrop} onPress={() => setFilterVisible(false)} />
        <View style={[s.filterSheet, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>Filter berita</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Tutup" onPress={() => setFilterVisible(false)} style={s.sheetClose}><Text style={s.sheetCloseText}>×</Text></Pressable>
          </View>
          <Text style={s.filterLabel}>Kategori</Text>
          <View style={s.chipGroup}>
            {categories.map((item) => <FilterChip key={item} label={item} selected={draftCategory === item} onPress={() => setDraftCategory(item)} />)}
          </View>
          <Text style={s.filterLabel}>Waktu terbit</Text>
          <View style={s.chipGroup}>
            {timeFilters.map((item) => <FilterChip key={item} label={item} selected={draftTimeFilter === item} onPress={() => setDraftTimeFilter(item)} />)}
          </View>
          <Text style={s.filterLabel}>Urutan</Text>
          <View style={s.chipGroup}>
            <FilterChip label="Terbaru" selected={draftNewestFirst} onPress={() => setDraftNewestFirst(true)} />
            <FilterChip label="Terlama" selected={!draftNewestFirst} onPress={() => setDraftNewestFirst(false)} />
          </View>
          <View style={s.sheetActions}>
            <Pressable accessibilityRole="button" onPress={resetFilters} style={s.resetButton}><Text style={s.resetButtonText}>Reset</Text></Pressable>
            <Pressable accessibilityRole="button" onPress={applyFilters} style={s.applyButton}><Text style={s.applyButtonText}>Terapkan</Text></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  </Page>;
}

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('id-ID').trim();
}

function isFuzzyMatch(word: string, token: string) {
  if (word.includes(token) || token.includes(word)) return true;
  if (Math.abs(word.length - token.length) > 1 || token.length < 5) return false;
  let edits = 0;
  let wordIndex = 0;
  let tokenIndex = 0;
  while (wordIndex < word.length && tokenIndex < token.length) {
    if (word[wordIndex] === token[tokenIndex]) {
      wordIndex += 1;
      tokenIndex += 1;
    } else {
      edits += 1;
      if (edits > 1) return false;
      if (word.length > token.length) wordIndex += 1;
      else if (token.length > word.length) tokenIndex += 1;
      else { wordIndex += 1; tokenIndex += 1; }
    }
  }
  return edits + (word.length - wordIndex) + (token.length - tokenIndex) <= 1;
}

function FilterGlyph() {
  const c = useColors();
  const s = styles(c);
  return <View style={s.filterGlyph}>
    <View style={[s.filterLine, { width: 17 }]} />
    <View style={[s.filterLine, { width: 12 }]} />
    <View style={[s.filterLine, { width: 7 }]} />
  </View>;
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const c = useColors();
  const s = styles(c);
  return <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={[s.chip, selected && s.chipSelected]}>
    <Text style={[s.chipText, selected && s.chipTextSelected]}>{label}</Text>
  </Pressable>;
}

const styles = (c: Palette) => StyleSheet.create({
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 4, marginBottom: 18 },
  searchBox: { height: 46, flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16 },
  searchGlyph: { color: c.primary, fontSize: 22 }, searchInput: { flex: 1, minWidth: 0, color: c.textPrimary, fontSize: 14, paddingVertical: 0 }, clearSearch: { color: c.textSecondary, fontSize: 22, paddingHorizontal: 2 },
  filterButton: { position: 'relative', width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  filterGlyph: { gap: 3, alignItems: 'flex-start' }, filterLine: { height: 2.5, borderRadius: 2, backgroundColor: c.primary },
  filterBadge: { position: 'absolute', top: -4, right: -4, minWidth: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary, borderWidth: 1, borderColor: c.onPrimary }, filterBadgeText: { color: c.onPrimary, fontSize: 9, fontWeight: '800' },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, resultsTitle: { color: c.textPrimary, fontSize: 18, fontWeight: '800' }, resultCount: { color: c.textSecondary, fontSize: 11 },
  articleList: { gap: 11 }, articleCard: { flexDirection: 'row', gap: 12, padding: 11, backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border },
  articleArtwork: { width: 84, minHeight: 100, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, articleGlyph: { fontSize: 34 }, articleCopy: { flex: 1, minWidth: 0, justifyContent: 'center' },
  articleMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5, marginBottom: 6 }, categoryTag: { color: c.primary, fontSize: 8, fontWeight: '800', letterSpacing: 0.6 }, articleDate: { color: c.textSecondary, fontSize: 9 }, articleTitle: { color: c.textPrimary, fontSize: 13, lineHeight: 18, fontWeight: '800' }, articleSummary: { color: c.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 4 }, readMore: { color: c.primary, fontSize: 10, fontWeight: '800', marginTop: 8 },
  emptyState: { alignItems: 'center', padding: 25, borderRadius: 20, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, marginTop: 5 }, emptyGlyph: { color: c.primary, fontSize: 34 }, emptyTitle: { color: c.textPrimary, fontSize: 15, fontWeight: '800', marginTop: 8 }, emptyCopy: { color: c.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 }, resetLink: { color: c.primary, fontSize: 12, fontWeight: '800', marginTop: 14 }, sampleNote: { color: c.textSecondary, fontSize: 10, textAlign: 'center', marginTop: 18 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' }, modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(16, 29, 23, 0.38)' },
  filterSheet: { paddingHorizontal: 22, paddingTop: 10, backgroundColor: '#F8FAF8', borderTopLeftRadius: 28, borderTopRightRadius: 28 }, sheetHandle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: '#C8D4CD', marginBottom: 12 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }, sheetTitle: { color: c.textPrimary, fontSize: 20, fontWeight: '800' }, sheetClose: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F0EB' }, sheetCloseText: { color: c.textSecondary, fontSize: 23, lineHeight: 26 },
  filterLabel: { color: c.textPrimary, fontSize: 13, fontWeight: '800', marginBottom: 9 }, chipGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 17 },
  chip: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface }, chipSelected: { borderColor: c.primary, backgroundColor: c.primary }, chipText: { color: c.textSecondary, fontSize: 11, fontWeight: '700' }, chipTextSelected: { color: c.onPrimary },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 1 }, resetButton: { minHeight: 48, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface }, resetButtonText: { color: c.textPrimary, fontSize: 14, fontWeight: '700' }, applyButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: c.primary }, applyButtonText: { color: c.onPrimary, fontSize: 14, fontWeight: '800' },
});
