import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import { Text } from '@/components/AppText';
import { MenuGroup, type MenuItem } from '@/components/MenuRow';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Notice, Page } from '@/components/ui';
import { getBiometricSupport, type BiometricSupport } from '@/features/auth/biometric';
import { loadPreferences, savePreferences, type Preferences } from '@/services/preferences';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export default function PengaturanScreen() {
  const [prefs, setPrefs] = useState<Preferences | null>(null);
  const [biometric, setBiometric] = useState<BiometricSupport | null>(null);
  const c = useColors();
  const s = styles(c);

  useEffect(() => {
    let active = true;
    void Promise.all([loadPreferences(), getBiometricSupport()]).then(([value, info]) => {
      if (!active) return;
      setPrefs(value);
      setBiometric(info);
    });
    return () => { active = false; };
  }, []);

  const toggle = async (key: keyof Preferences) => {
    if (!prefs) return;
    const next = await savePreferences({ [key]: !prefs[key] } as Partial<Preferences>);
    setPrefs(next);
  };

  const version = Constants.expoConfig?.version ?? '—';

  if (!prefs) {
    return <Page><ScreenHeader kicker="APLIKASI" title="Pengaturan" /><View style={s.loading}><Text style={s.loadingText}>Memuat pengaturan…</Text></View></Page>;
  }

  const items: MenuItem[] = [
    {
      kind: 'switch',
      key: 'notifications',
      icon: 'bell-outline',
      label: 'Notifikasi',
      description: 'Pengingat jadwal pemupukan dan kabar pesanan.',
      value: prefs.notifications,
      onValueChange: () => void toggle('notifications'),
    },
  ];

  if (biometric?.usable) {
    items.push({
      kind: 'switch',
      key: 'biometric',
      icon: 'fingerprint',
      label: 'Kunci dengan biometrik',
      description: `Buka aplikasi dengan ${biometric.kindName} setiap kali dibuka.`,
      value: prefs.biometric,
      onValueChange: () => void toggle('biometric'),
    });
  } else {
    items.push({
      kind: 'link',
      key: 'biometric-info',
      icon: 'fingerprint',
      label: 'Kunci dengan biometrik',
      badge: 'Tidak tersedia',
      description: biometric?.reason ?? 'Perangkat ini tidak mendukung biometrik.',
      onPress: () => {},
    });
  }

  return (
    <Page>
      <ScreenHeader kicker="APLIKASI" title="Pengaturan" subtitle="Preferensi tersimpan pada perangkat ini." />
      <MenuGroup title="Umum" items={items} />
      <MenuGroup
        title="Tentang"
        items={[
          {
            kind: 'link',
            key: 'version',
            icon: 'information-outline',
            label: 'Versi aplikasi',
            description: `Avasthani ${version}`,
            onPress: () => {},
          },
        ]}
      />
      <Notice>Tema dan preferensi tersimpan di perangkat ini, tidak mengikuti akun ke HP lain.</Notice>
    </Page>
  );
}

const styles = (c: Palette) => StyleSheet.create({
  loading: { paddingVertical: 40, alignItems: 'center' },
  loadingText: { color: c.textSecondary, fontSize: 13 },
});
