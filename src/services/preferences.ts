// =============================================================================
// Avasthani - Preferensi pengguna (lokal, per perangkat)
//
// Disimpan di AsyncStorage, bukan Firestore, karena sifatnya mengikuti
// perangkat: mode gelap, kunci biometrik, dan notifikasi diatur per HP.
// =============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

export type Preferences = {
  /** Dicadangkan: tema gelap belum diimplementasikan. */
  darkMode: boolean;
  /** Kunci aplikasi dengan sidik jari / wajah. */
  biometric: boolean;
  notifications: boolean;
};

const STORAGE_KEY = 'avasthani-preferences';

export const DEFAULT_PREFERENCES: Preferences = {
  darkMode: false,
  biometric: false,
  notifications: true,
};

function toBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export async function loadPreferences(): Promise<Preferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      darkMode: toBoolean(parsed.darkMode, DEFAULT_PREFERENCES.darkMode),
      biometric: toBoolean(parsed.biometric, DEFAULT_PREFERENCES.biometric),
      notifications: toBoolean(parsed.notifications, DEFAULT_PREFERENCES.notifications),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(patch: Partial<Preferences>): Promise<Preferences> {
  const current = await loadPreferences();
  const next = { ...current, ...patch };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
