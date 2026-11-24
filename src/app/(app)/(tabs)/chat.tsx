import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { Page, Title } from '@/components/ui';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export default function ChatTab() {
  const c = useColors();
  const s = styles(c);
  return <Page bottomPadding={112}><Title title="Chat" subtitle="Percakapan Anda akan tampil di sini." /><View style={s.empty}><View style={s.bubble}><View style={s.dot} /><View style={s.dot} /><View style={s.dot} /></View><Text style={s.title}>Belum ada percakapan</Text><Text style={s.copy}>Setelah fitur komunikasi tersedia, Anda dapat menghubungi tim dan mitra usaha dari halaman ini.</Text></View></Page>;
}
const styles = (c: Palette) => StyleSheet.create({ empty: { minHeight: 280, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }, bubble: { height: 56, width: 68, borderRadius: 20, backgroundColor: c.primarySoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 18 }, dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary }, title: { color: c.textPrimary, fontSize: 17, fontWeight: '800', marginBottom: 7 }, copy: { color: c.textSecondary, textAlign: 'center', lineHeight: 21, fontSize: 14 } });
