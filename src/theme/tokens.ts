// =============================================================================
// Avasthani - Design tokens (dari DESIGN.md section 7)
//
// Warna tampil dua palet: LIGHT dan DARK, dengan kunci yang sama persis.
// Komponen mengambil warna dari useColors() (ThemeProvider) sehingga
// seluruh aplikasi berpindah palet saat Darkmode diaktifkan.
// =============================================================================

export const LIGHT = {
  primary: '#216E4E',
  primaryDark: '#164B36',
  primarySoft: '#E8F4EC',
  accent: '#E9A23B',
  background: '#F7F8F5',
  surface: '#FFFFFF',
  textPrimary: '#202923',
  textSecondary: '#66736A',
  border: '#DCE4DD',
  danger: '#B42318',
  dangerSoft: '#FDECEA',
  success: '#18794E',
  successSoft: '#E5F2E6',
  warning: '#9A6700',
  warningSoft: '#FFF6E5',
  /** Latar saat baris/kartu ditekan. */
  pressed: '#F4F8F5',
  /** Warna teks/ikon di atas bidang berwarna primary. */
  onPrimary: '#FFFFFF',
  isDark: false,
};

export const DARK: Palette = {
  primary: '#37A97A',
  primaryDark: '#1D7350',
  primarySoft: '#1F3A2C',
  accent: '#E9A23B',
  background: '#101713',
  surface: '#18211C',
  textPrimary: '#EAF1EC',
  textSecondary: '#9AAFA3',
  border: '#2B3A32',
  danger: '#F2705C',
  dangerSoft: '#3B201A',
  success: '#43C08B',
  successSoft: '#173529',
  warning: '#DCAD57',
  warningSoft: '#3A3118',
  pressed: '#212D26',
  onPrimary: '#FFFFFF',
  isDark: true,
};

export type Palette = typeof LIGHT;

export const RADIUS = {
  card: 12,
  button: 10,
  input: 10,
  avatar: 999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const FONT_SIZE = {
  screenTitle: 24,
  sectionTitle: 17,
  body: 15,
  caption: 13,
  helper: 12,
} as const;

export const TOUCH_TARGET = 44;
