import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Text, TextInput } from '@/components/AppText';
import { useColors } from '@/theme/ThemeProvider';
import { RADIUS, SPACING, type Palette } from '@/theme/tokens';

export function Page({ children, bottomPadding = 40, onScroll }: PropsWithChildren<{ bottomPadding?: number; onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void }>) {
  const c = useColors();
  return <ScrollView contentContainerStyle={[styles(c).page, { paddingBottom: bottomPadding }]} keyboardShouldPersistTaps="handled" onScroll={onScroll} scrollEventThrottle={16}>{children}</ScrollView>;
}

export function BrandMark() {
  const c = useColors();
  const s = styles(c);
  return <View style={s.brandRow}><View style={s.brandIcon}><Text style={s.brandGlyph}>A</Text></View><Text style={s.brandName}>avasthani</Text></View>;
}

export function Title({ title, subtitle }: { title: string; subtitle?: string }) {
  const c = useColors();
  const s = styles(c);
  return <View style={s.titleWrap}><Text style={s.title}>{title}</Text>{subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}</View>;
}

export function Field({ label, error, ...props }: { label: string; error?: string } & React.ComponentProps<typeof TextInput>) {
  const c = useColors();
  const s = styles(c);
  return <View style={s.field}><Text style={s.label}>{label}</Text><TextInput placeholderTextColor={c.textSecondary} style={[s.input, error ? s.inputError : null]} accessibilityLabel={label} {...props} />{error ? <Text style={s.error}>{error}</Text> : null}</View>;
}

export function PrimaryButton({ title, onPress, disabled, busy }: { title: string; onPress: () => void; disabled?: boolean; busy?: boolean }) {
  const c = useColors();
  const s = styles(c);
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled || busy} style={({ pressed }) => [s.button, pressed && { opacity: 0.85 }, (disabled || busy) && { opacity: 0.55 }]}>{busy ? <ActivityIndicator color={c.onPrimary} /> : <Text style={s.buttonText}>{title}</Text>}</Pressable>;
}

export function Choice({ title, description, selected, onPress }: { title: string; description: string; selected: boolean; onPress: () => void }) {
  const c = useColors();
  const s = styles(c);
  return <Pressable accessibilityRole="radio" accessibilityState={{ selected }} onPress={onPress} style={[s.choice, selected && s.choiceSelected]}><View style={[s.radio, selected && s.radioSelected]} /><View style={{ flex: 1 }}><Text style={s.choiceTitle}>{title}</Text><Text style={s.choiceDescription}>{description}</Text></View></Pressable>;
}

export function Notice({ children, tone = 'info' }: PropsWithChildren<{ tone?: 'info' | 'error' | 'success' }>) {
  const c = useColors();
  const s = styles(c);
  const toneStyle = tone === 'error' ? s.noticeError : tone === 'success' ? s.noticeSuccess : s.noticeInfo;
  return <View style={[s.notice, toneStyle, s.brandRow]}><Text style={s.noticeText}>{children}</Text></View>;
}

const styles = (c: Palette) => StyleSheet.create({
  page: { flexGrow: 1, backgroundColor: c.background, padding: SPACING.lg, paddingTop: 28, paddingBottom: 40 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, marginTop: 14 },
  brandIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
  brandGlyph: { color: '#fff', fontSize: 23, fontWeight: '800' }, brandName: { fontSize: 22, fontWeight: '800', color: c.primaryDark, letterSpacing: -0.7 },
  titleWrap: { marginBottom: 24, gap: 8 }, title: { color: c.textPrimary, fontSize: 27, fontWeight: '800', letterSpacing: -0.6 }, subtitle: { color: c.textSecondary, fontSize: 15, lineHeight: 22 },
  field: { marginBottom: 16, gap: 7 }, label: { color: c.textPrimary, fontSize: 14, fontWeight: '600' },
  input: { minHeight: 50, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: RADIUS.input, paddingHorizontal: 14, paddingVertical: 12, color: c.textPrimary, fontSize: 15 }, inputError: { borderColor: c.danger }, error: { color: c.danger, fontSize: 12 },
  button: { minHeight: 50, borderRadius: RADIUS.button, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 8 }, buttonText: { color: c.onPrimary, fontWeight: '700', fontSize: 15 },
  choice: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: c.border, borderRadius: RADIUS.card, backgroundColor: c.surface, padding: 14, marginBottom: 10 }, choiceSelected: { borderColor: c.primary, backgroundColor: c.primarySoft }, radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: c.textSecondary }, radioSelected: { borderWidth: 6, borderColor: c.primary }, choiceTitle: { fontWeight: '700', color: c.textPrimary, fontSize: 15 }, choiceDescription: { color: c.textSecondary, fontSize: 13, marginTop: 3 },
  notice: { padding: 13, borderRadius: 10, marginBottom: 16 }, noticeInfo: { backgroundColor: c.primarySoft }, noticeError: { backgroundColor: c.dangerSoft }, noticeSuccess: { backgroundColor: c.successSoft }, noticeText: { color: c.textPrimary, fontSize: 14, lineHeight: 20 },
});
