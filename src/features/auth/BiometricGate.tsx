// =============================================================================
// Avasthani - Gerbang kunci aplikasi
//
// Bila Biometrik diaktifkan dan perangkat mendukung, aplikasi wajib dibuka
// dengan verifikasi. Status terbuka berlaku selama aplikasi masih hidup di
// memori (cold start), sehingga tidak menagih verifikasi setiap kali
// pengguna berpindah layar.
// =============================================================================

import { useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { authenticateBiometric, getBiometricSupport, type BiometricSupport } from '@/features/auth/biometric';
import { loadPreferences } from '@/services/preferences';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

// Tetap tersimpan selama proses aplikasi hidup, meski komponen dipasang ulang.
let unlockedThisSession = false;

type LockState = 'loading' | 'locked' | 'open';

export function BiometricGate({ children }: PropsWithChildren) {
  const c = useColors();
  const s = styles(c);
  const [state, setState] = useState<LockState>(unlockedThisSession ? 'open' : 'loading');
  const [support, setSupport] = useState<BiometricSupport | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (unlockedThisSession) return;
    let active = true;
    void (async () => {
      const [prefs, info] = await Promise.all([loadPreferences(), getBiometricSupport()]);
      if (!active) return;
      setSupport(info);
      const shouldLock = prefs.biometric && info.usable;
      unlockedThisSession = !shouldLock;
      setState(shouldLock ? 'locked' : 'open');
    })();
    return () => { active = false; };
  }, []);

  const unlock = async () => {
    if (checking) return;
    setChecking(true);
    const ok = await authenticateBiometric(support?.kindName ?? 'biometrik');
    setChecking(false);
    if (ok) {
      unlockedThisSession = true;
      setState('open');
    }
  };

  if (state === 'loading') {
    return <View style={s.backdrop}><ActivityIndicator color={c.primary} /></View>;
  }

  if (state === 'open') return <>{children}</>;

  return (
    <View style={s.backdrop}>
      <View style={s.card}>
        <Text style={s.glyph}>🔒</Text>
        <Text style={s.title}>Aplikasi terkunci</Text>
        <Text style={s.copy}>Gunakan {support?.kindName ?? 'biometrik'} untuk membuka Avasthani.</Text>
        <Pressable accessibilityRole="button" disabled={checking} onPress={() => void unlock()} style={[s.primaryButton, checking && s.busy]}>
          <Text style={s.primaryText}>{checking ? 'Memeriksa…' : `Buka dengan ${support?.kindName ?? 'biometrik'}`}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.background, padding: 28 },
  card: { width: '100%', maxWidth: 340, backgroundColor: c.surface, borderRadius: 26, padding: 24, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: c.border },
  glyph: { fontSize: 44, marginBottom: 2 },
  title: { color: c.textPrimary, fontSize: 20, fontWeight: '800' },
  copy: { color: c.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  primaryButton: { marginTop: 14, minHeight: 50, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, width: '100%' },
  primaryText: { color: c.onPrimary, fontWeight: '800', fontSize: 14 },
  busy: { opacity: 0.7 },
});
