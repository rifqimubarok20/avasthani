// =============================================================================
// Avasthani - Typography
//
// Plus Jakarta Sans dimuat per-weight sebagai font family terpisah
// (bukan satu family dengan banyak face) supaya pemilihan bobot tetap benar
// di Android API < 29, karena minSdk aplikasi ini 24.
// =============================================================================

import {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';

export const FONT_FAMILY = {
  light: 'PlusJakartaSans_300Light',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
} as const;

export const FONT_ASSETS = {
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
};

/**
 * Petakan `fontWeight` ke family yang sesuai.
 * Dipakai karena RN tidak bisa memilih face dari satu family di Android lama.
 */
export function fontFamilyForWeight(
  weight?: string | number | null
): (typeof FONT_FAMILY)[keyof typeof FONT_FAMILY] {
  switch (String(weight ?? '400')) {
    case '100':
    case '200':
    case '300':
      return FONT_FAMILY.light;
    case '500':
      return FONT_FAMILY.medium;
    case '600':
      return FONT_FAMILY.semibold;
    case '700':
    case 'bold':
      return FONT_FAMILY.bold;
    case '800':
    case '900':
      return FONT_FAMILY.extrabold;
    default:
      return FONT_FAMILY.regular;
  }
}
