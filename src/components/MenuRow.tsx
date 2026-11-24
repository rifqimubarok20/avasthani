// =============================================================================
// Avasthani - Baris menu bergaya daftar pengaturan
//
// Satu grup = satu kartu putih berisi beberapa baris dengan garis pemisah.
// Baris bisa berupa tautan (dengan chevron) atau sakelar (toggle).
// =============================================================================

import { Pressable, StyleSheet, Switch, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text } from '@/components/AppText';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

type IconGlyph = NonNullable<ComponentProps<typeof MaterialCommunityIcons>['name']>;

export type MenuItem =
  | {
      kind: 'link';
      key: string;
      icon: IconGlyph;
      label: string;
      description?: string;
      badge?: string;
      tone?: 'default' | 'danger';
      onPress: () => void;
    }
  | {
      kind: 'switch';
      key: string;
      icon: IconGlyph;
      label: string;
      description?: string;
      badge?: string;
      value: boolean;
      disabled?: boolean;
      onValueChange: (value: boolean) => void;
    };

export function MenuGroup({ title, items }: { title?: string; items: MenuItem[] }) {
  const c = useColors();
  const s = styles(c);
  return (
    <View style={s.group}>
      {title ? <Text style={s.groupTitle}>{title}</Text> : null}
      <View style={s.card}>
        {items.map((item, index) => (
          <View key={item.key} style={[s.row, index > 0 && s.rowDivided]}>
            {item.kind === 'link' ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.label}
                onPress={item.onPress}
                style={({ pressed }) => [s.rowInner, pressed && s.pressed]}
              >
                <RowBody item={item} />
                <Text style={[s.chevron, item.tone === 'danger' && s.danger]}>›</Text>
              </Pressable>
            ) : (
              <View style={s.rowInner}>
                <RowBody item={item} />
                <Switch
                  accessibilityLabel={item.label}
                  value={item.value}
                  onValueChange={item.onValueChange}
                  disabled={item.disabled}
                  trackColor={{ false: c.border, true: c.primary }}
                  thumbColor={c.surface}
                  ios_backgroundColor={c.border}
                />
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function RowBody({ item }: { item: MenuItem }) {
  const c = useColors();
  const s = styles(c);
  const danger = item.kind === 'link' && item.tone === 'danger';
  return (
    <View style={s.rowBody}>
      <View style={[s.iconTile, danger && s.iconTileDanger]}>
        <MaterialCommunityIcons name={item.icon} size={20} color={danger ? c.danger : c.primary} />
      </View>
      <View style={s.copy}>
        <View style={s.labelRow}>
          <Text style={[s.label, danger && s.danger]}>{item.label}</Text>
          {item.badge ? <Text style={s.badge}>{item.badge}</Text> : null}
        </View>
        {item.description ? <Text style={s.description}>{item.description}</Text> : null}
      </View>
    </View>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  group: { marginBottom: 18 },
  groupTitle: { color: c.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, overflow: 'hidden' },
  row: { backgroundColor: c.surface },
  rowDivided: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.border },
  rowInner: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13, paddingVertical: 10 },
  pressed: { backgroundColor: c.pressed },
  rowBody: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0 },
  iconTile: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primarySoft },
  iconTileDanger: { backgroundColor: c.dangerSoft },
  copy: { flex: 1, minWidth: 0 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  label: { color: c.textPrimary, fontSize: 14, fontWeight: '700', flexShrink: 1 },
  description: { color: c.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 2 },
  badge: { color: c.warning, backgroundColor: c.warningSoft, fontSize: 9, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden' },
  chevron: { color: c.border, fontSize: 22, fontWeight: '800' },
  danger: { color: c.danger },
});
