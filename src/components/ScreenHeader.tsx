// =============================================================================
// Avasthani - Kepala halaman untuk layar turunan (bukan tab)
// =============================================================================

import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { BackButton } from '@/components/BackButton';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export function ScreenHeader({
  kicker,
  title,
  subtitle,
  onBack,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  const c = useColors();
  const s = styles(c);
  return (
    <>
      <View style={s.row}>
        <BackButton onPress={onBack ?? (() => router.back())} size={44} />
        <View style={s.copy}>
          {kicker ? <Text style={s.kicker}>{kicker}</Text> : null}
          <Text style={s.title}>{title}</Text>
        </View>
      </View>
      {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
    </>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  copy: { flex: 1, minWidth: 0 },
  kicker: { color: c.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: c.textPrimary, fontSize: 20, fontWeight: '800' },
  subtitle: { color: c.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 18 },
});
