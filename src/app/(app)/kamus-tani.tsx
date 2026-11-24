import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Text, TextInput } from '@/components/AppText';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Page } from '@/components/ui';
import { GLOSSARY, type GlossaryEntry } from '@/features/learn/data';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

const CATEGORIES = ['Semua', 'Hara', 'Pupuk', 'Tanah', 'Budidaya'] as const;
type Category = (typeof CATEGORIES)[number];

export default function KamusTaniScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('Semua');
  const c = useColors();
  const s = styles(c);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return GLOSSARY.filter((entry) => {
      if (category !== 'Semua' && entry.category !== category) return false;
      if (!needle) return true;
      return entry.term.toLowerCase().includes(needle) || entry.definition.toLowerCase().includes(needle);
    });
  }, [category, query]);

  return (
    <Page>
      <ScreenHeader kicker="BELAJAR" title="Kamus Tani" subtitle="Istilah pertanian yang sering muncul di aplikasi dan literatur." />
      <View style={s.searchBox}>
        <Text style={s.searchGlyph}>⌕</Text>
        <TextInput value={query} onChangeText={setQuery} placeholder="Cari istilah…" accessibilityLabel="Cari istilah" style={s.searchInput} />
        {query ? <Pressable accessibilityRole="button" accessibilityLabel="Bersihkan pencarian" onPress={() => setQuery('')} hitSlop={8}><Text style={s.clear}>×</Text></Pressable> : null}
      </View>
      <View style={s.chips}>{CATEGORIES.map((item) => (
        <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)} style={[s.chip, category === item && s.chipSelected]}>
          <Text style={[s.chipText, category === item && s.chipTextSelected]}>{item}</Text>
        </Pressable>
      ))}</View>

      {results.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyGlyph}>📖</Text>
          <Text style={s.emptyTitle}>Tidak ada istilah yang cocok</Text>
          <Text style={s.emptyCopy}>Coba kata lain, misalnya “NPK”, “uji tanah”, atau “vegetatif”.</Text>
        </View>
      ) : (
        <View style={s.list}>
          {results.map((entry) => <TermCard key={entry.term} entry={entry} />)}
        </View>
      )}

      <Link href="/(app)/academy" style={s.link}>Buka Avasthani Academy ›</Link>
    </Page>
  );
}

function TermCard({ entry }: { entry: GlossaryEntry }) {
  const [open, setOpen] = useState(false);
  const c = useColors();
  const s = styles(c);
  return (
    <View style={s.card}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpen((value) => !value)} style={s.head}>
        <Text style={s.term}>{entry.term}</Text>
        <View style={s.headRight}>
          <Text style={s.category}>{entry.category}</Text>
          <Text style={s.chevron}>{open ? '−' : '+'}</Text>
        </View>
      </Pressable>
      {open ? <Text style={s.definition}>{entry.definition}</Text> : null}
    </View>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  searchBox: { height: 46, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 14 },
  searchGlyph: { color: c.primary, fontSize: 20 },
  searchInput: { flex: 1, minWidth: 0, color: c.textPrimary, fontSize: 14, paddingVertical: 0 },
  clear: { color: c.textSecondary, fontSize: 24, paddingHorizontal: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, marginBottom: 14 },
  chip: { paddingVertical: 8, paddingHorizontal: 13, borderRadius: 16, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  chipSelected: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { color: c.textSecondary, fontSize: 12, fontWeight: '700' },
  chipTextSelected: { color: c.onPrimary },
  list: { gap: 10 },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 14, paddingHorizontal: 14, overflow: 'hidden' },
  head: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  term: { color: c.textPrimary, fontSize: 14, fontWeight: '700', flexShrink: 1 },
  headRight: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  category: { color: c.textSecondary, backgroundColor: c.pressed, fontSize: 9, fontWeight: '800', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  chevron: { color: c.primary, fontSize: 20, fontWeight: '800' },
  definition: { color: c.textSecondary, fontSize: 13, lineHeight: 19, paddingBottom: 13, paddingRight: 6 },
  empty: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, padding: 26, alignItems: 'center', gap: 6 },
  emptyGlyph: { fontSize: 38 },
  emptyTitle: { color: c.textPrimary, fontSize: 15, fontWeight: '800' },
  emptyCopy: { color: c.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  link: { color: c.primary, fontWeight: '800', paddingVertical: 12 },
});
