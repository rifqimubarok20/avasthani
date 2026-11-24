// =============================================================================
// Avasthani - ThemeProvider (tema terang / gelap)
//
// Satu sumber kebenaran warna: komponen memanggil useColors() untuk mendapat
// palet aktif. Ketika pengguna menyaklar Darkmode, provider mengganti palet dan
// seluruh pohon yang memakai useColors() ikut dirender ulang.
//
// Pilihan tersimpan di preferensi perangkat (AsyncStorage, kunci `darkMode`)
// sehingga tema bertahan antar pembukaan aplikasi.
// =============================================================================

import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { loadPreferences, savePreferences } from '@/services/preferences';
import { DARK, LIGHT, type Palette } from '@/theme/tokens';

type ThemeContextValue = {
  /** Palet warna aktif untuk seluruh komponen. */
  colors: Palette;
  /** Benar bila tema gelap sedang aktif. */
  dark: boolean;
  /** Ubah tema (dan simpan preferensinya). */
  setDark: (dark: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [colors, setColors] = useState<Palette>(LIGHT);
  const [dark, setDarkState] = useState(false);

  // Tema awal dibaca sekali dari preferensi tersimpan.
  useEffect(() => {
    let active = true;
    void loadPreferences().then((prefs) => {
      if (!active || !prefs.darkMode) return;
      setColors(DARK);
      setDarkState(true);
    });
    return () => { active = false; };
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors,
      dark,
      setDark: (next) => {
        setColors(next ? DARK : LIGHT);
        setDarkState(next);
        void savePreferences({ darkMode: next });
      },
    }),
    [colors, dark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Palet warna aktif — ada di setiap layar/komponen yang memakai warna. */
export function useColors(): Palette {
  const ctx = useContext(ThemeContext);
  return ctx ? ctx.colors : LIGHT;
}

/** Palet + saklar tema (untuk StatusBar, dsb). */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  return ctx ?? { colors: LIGHT, dark: false, setDark: () => {} };
}
