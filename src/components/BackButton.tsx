// =============================================================================
// Avasthani - BackButton
//
// Tombol kembali bulat dengan chevron yang DIGAMBAR, bukan karakter teks "‹".
//
// Karakter "‹" diposisikan oleh metrik font (ascent/descent/baseline), bukan
// oleh kotak tintanya. Tinta "‹" duduk tinggi di dalam em box dan side
// bearing-nya tidak simetris, sehingga selalu butuh koreksi manual seperti
// `marginTop: -3` — angka yang hanya pas untuk font tertentu. Begitu font
// diganti, koreksinya jadi meleset dan panah terlihat tidak di tengah.
//
// Chevron di sini dibentuk dari dua batang yang diposisikan secara matematis,
// jadi selalu simetris terhadap titik pusat lingkaran, apa pun font-nya.
// =============================================================================

import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useColors } from '@/theme/ThemeProvider';

type Props = {
  onPress: () => void;
  /** Diameter lingkaran. */
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function BackButton({
  onPress,
  size = 42,
  color,
  backgroundColor,
  style,
  accessibilityLabel = 'Kembali',
}: Props) {
  // Default warna mengikuti tema aktif.
  const c = useColors();
  const ink = color ?? c.primary;
  const tileBg = backgroundColor ?? c.primarySoft;
  // Kotak chevron: w = lebar, h = tinggi. Panah "‹" dibuat dari dua batang
  // yang bertemu di titik tengah sisi kiri kotak.
  const w = Math.round(size * 0.21);
  const h = Math.round(size * 0.3);
  const stroke = Math.max(2, Math.round(size * 0.055 * 10) / 10);
  const length = Math.sqrt(w * w + (h / 2) * (h / 2));
  const angle = (Math.atan(h / 2 / w) * 180) / Math.PI;

  const bar = {
    position: 'absolute' as const,
    width: length,
    height: stroke,
    borderRadius: stroke / 2,
    backgroundColor: ink,
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: tileBg },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={{ width: w, height: h }}>
        <View
          style={[
            bar,
            { left: (w - length) / 2, top: h / 4 - stroke / 2, transform: [{ rotate: `${-angle}deg` }] },
          ]}
        />
        <View
          style={[
            bar,
            { left: (w - length) / 2, top: (3 * h) / 4 - stroke / 2, transform: [{ rotate: `${angle}deg` }] },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
});
