// =============================================================================
// Avasthani - Avatar pengguna
//
// Menampilkan foto profil bila ada, atau inisial nama bila belum ada.
// Saat `editable`, muncul tombol kamera kecil di sudut sebagai penanda
// bahwa foto bisa diganti.
// =============================================================================

import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

type Props = {
  uri?: string | null;
  name?: string | null;
  size?: number;
  editable?: boolean;
  busy?: boolean;
  onPress?: () => void;
};

function initialsOf(name?: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'A';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function Avatar({ uri, name, size = 92, editable, busy, onPress }: Props) {
  const c = useColors();
  const s = styles(c);
  const badge = Math.round(size * 0.32);

  const content = (
    <View style={[s.ring, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} resizeMode="cover" accessibilityLabel={`Foto profil ${name ?? ''}`.trim()} />
      ) : (
        <View style={[s.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[s.initials, { fontSize: Math.round(size * 0.34) }]}>{initialsOf(name)}</Text>
        </View>
      )}
      {busy ? (
        <View style={[StyleSheet.absoluteFill, s.busyOverlay, { borderRadius: size / 2 }]}>
          <ActivityIndicator color={c.onPrimary} />
        </View>
      ) : null}
    </View>
  );

  if (!editable) return content;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ganti foto profil"
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [pressed && s.pressed]}
    >
      {content}
      <View style={[s.badge, { width: badge, height: badge, borderRadius: badge / 2 }]}>
        <Text style={[s.badgeGlyph, { fontSize: Math.round(badge * 0.5) }]}>📷</Text>
      </View>
    </Pressable>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  ring: { backgroundColor: c.primarySoft, borderWidth: 3, borderColor: c.surface, alignItems: 'center', justifyContent: 'center', overflow: 'visible' },
  fallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary },
  initials: { color: c.onPrimary, fontWeight: '800', letterSpacing: 1 },
  busyOverlay: { alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(18, 31, 25, 0.45)' },
  pressed: { opacity: 0.85 },
  badge: { position: 'absolute', right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary, borderWidth: 3, borderColor: c.surface },
  badgeGlyph: { color: c.onPrimary },
});
