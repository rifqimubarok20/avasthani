import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/AppText';
import { googleSignInErrorMessage, signInWithGoogle } from '@/services/firebase/google-auth';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export function GoogleAuthButton({ title = 'Lanjutkan dengan Google' }: { title?: string }) {
  const c = useColors();
  const s = styles(c);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Google Sign-In gagal', googleSignInErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return <View style={s.container}>
    <View style={s.divider}><View style={s.line} /><Text style={s.or}>atau</Text><View style={s.line} /></View>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={busy}
      onPress={() => void submit()}
      style={({ pressed }) => [s.button, pressed && s.pressed, busy && s.busy]}
    >
      {busy ? <ActivityIndicator color={c.primary} /> : <>
        <Text accessibilityElementsHidden style={s.googleGlyph}>G</Text>
        <Text style={s.label}>{title}</Text>
      </>}
    </Pressable>
  </View>;
}

const styles = (c: Palette) => StyleSheet.create({
  container: { marginTop: 15 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 13 },
  line: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: c.border },
  or: { color: c.textSecondary, fontSize: 13 },
  button: { minHeight: 48, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, borderRadius: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 16 },
  pressed: { opacity: 0.82 },
  busy: { opacity: 0.65 },
  googleGlyph: { color: '#4285F4', fontSize: 19, fontWeight: '800' },
  label: { color: c.textPrimary, fontSize: 15, fontWeight: '600' },
});
