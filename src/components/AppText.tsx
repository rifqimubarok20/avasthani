// =============================================================================
// Avasthani - Text & TextInput dengan font aplikasi
//
// Semua teks memakai Plus Jakarta Sans. Bobot (`fontWeight`) diterjemahkan ke
// font family per-weight, lalu `fontWeight` dibuang agar Android tidak
// menebalkan ulang secara sintetis.
//
// Impor `Text`/`TextInput` dari sini, bukan langsung dari 'react-native'.
// =============================================================================

import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from 'react-native';
import { fontFamilyForWeight } from '@/theme/typography';

function resolveStyle(style: StyleProp<TextStyle>): TextStyle {
  const flat = StyleSheet.flatten(style) ?? {};
  const { fontWeight, ...rest } = flat;
  return {
    ...rest,
    fontFamily: flat.fontFamily ?? fontFamilyForWeight(fontWeight),
  };
}

export function Text({ style, ...props }: TextProps) {
  return <RNText {...props} style={resolveStyle(style)} />;
}

export function TextInput({ style, ...props }: TextInputProps) {
  return <RNTextInput {...props} style={resolveStyle(style)} />;
}
