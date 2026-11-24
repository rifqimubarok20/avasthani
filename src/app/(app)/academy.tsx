import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { Text } from '@/components/AppText';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Notice, Page } from '@/components/ui';
import { LESSONS, type Lesson } from '@/features/learn/data';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export default function AcademyScreen() {
  const [expanded, setExpanded] = useState<string | null>(LESSONS[0]?.id ?? null);
  const c = useColors();
  const s = styles(c);

  return (
    <Page>
      <ScreenHeader
        kicker="BELAJAR"
        title="Avasthani Academy"
        subtitle="Materi singkat pemupukan dan budidaya, ditulis agar bisa langsung dipraktikkan."
      />
      <View style={s.lessonList}>
        {LESSONS.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            expanded={expanded === lesson.id}
            onToggle={() => setExpanded((current) => (current === lesson.id ? null : lesson.id))}
          />
        ))}
      </View>
      <Notice>
        Materi ini bersifat umum. Ikuti hasil uji tanah, label pupuk, dan arahan penyuluh untuk keputusan di lahan Anda.
      </Notice>
      <Link href="/(app)/kamus-tani" style={s.link}>Buka Kamus Tani ›</Link>
    </Page>
  );
}

function LessonCard({ lesson, expanded, onToggle }: { lesson: Lesson; expanded: boolean; onToggle: () => void }) {
  const c = useColors();
  const s = styles(c);
  return (
    <View style={s.card}>
      <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={onToggle} style={s.pressable}>
        <View style={[s.tile, { backgroundColor: lesson.tint }]}>
          <Text style={s.tileGlyph}>{lesson.glyph}</Text>
        </View>
        <View style={s.head}>
          <View style={s.meta}>
            <Text style={s.level}>{lesson.level}</Text>
            <Text style={s.dot}>·</Text>
            <Text style={s.level}>{lesson.minutes} menit</Text>
          </View>
          <Text style={s.title}>{lesson.title}</Text>
          <Text style={s.summary}>{lesson.summary}</Text>
        </View>
        <Text style={s.chevron}>{expanded ? '−' : '+'}</Text>
      </Pressable>
      {expanded ? (
        <View style={s.body}>
          {lesson.points.map((point, index) => (
            <View key={index} style={s.pointRow}>
              <Text style={s.pointIndex}>{index + 1}</Text>
              <Text style={s.pointText}>{point}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  lessonList: { gap: 12, marginBottom: 16 },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, overflow: 'hidden' },
  pressable: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  tile: { width: 58, height: 58, marginLeft: 13, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  tileGlyph: { fontSize: 26 },
  head: { flex: 1, minWidth: 0, paddingVertical: 13 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  level: { color: c.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  dot: { color: c.textSecondary, fontSize: 10 },
  title: { color: c.textPrimary, fontSize: 14, fontWeight: '800', lineHeight: 19 },
  summary: { color: c.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 3 },
  chevron: { color: c.primary, fontSize: 22, fontWeight: '800', paddingHorizontal: 12 },
  body: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border, padding: 15, paddingTop: 12, gap: 11 },
  pointRow: { flexDirection: 'row', gap: 10 },
  pointIndex: { color: c.primary, fontSize: 11, fontWeight: '800', lineHeight: 18, minWidth: 14 },
  pointText: { color: c.textPrimary, fontSize: 13, lineHeight: 18, flex: 1 },
  link: { color: c.primary, fontWeight: '800', paddingVertical: 10 },
});

