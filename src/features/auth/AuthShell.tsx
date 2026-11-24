import type { PropsWithChildren } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View, type TextInputProps } from 'react-native';
import { Text, TextInput } from '@/components/AppText';
type AuthIconName = 'user' | 'email' | 'lock';
type AuthInputProps = { label: string; placeholder: string; icon: AuthIconName } & TextInputProps;

export function AuthScreen({ children }: PropsWithChildren) {
  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.decorationOne} />
          <View style={styles.decorationTwo} />
          <Text style={styles.greeting}>Halo!</Text>
          <Text style={styles.tagline}>Kelola kebutuhan usaha Anda dengan lebih mudah.</Text>
          <View accessibilityElementsHidden style={styles.plant}>
            <View style={[styles.leaf, styles.leafLeft]} />
            <View style={[styles.leaf, styles.leafRight]} />
            <View style={styles.stem} />
            <View style={styles.pot} />
            <View style={styles.potRim} />
          </View>
        </View>
        <View style={styles.card}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function AuthTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.titleWrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

export function AuthInput({ label, placeholder, icon, style, ...props }: AuthInputProps) {
  return (
    <View style={styles.inputWrap}>
      <AuthInputIcon name={icon} />
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor="#A5B4B0"
        autoCorrect={false}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

function AuthInputIcon({ name }: { name: AuthIconName }) {
  return (
    <View style={styles.iconFrame} accessibilityElementsHidden>
      {name === 'user' ? (
        <>
          <View style={styles.userHead} />
          <View style={styles.userBody} />
        </>
      ) : name === 'email' ? (
        <View style={styles.envelope}>
          <View style={[styles.envelopeFold, styles.envelopeFoldLeft]} />
          <View style={[styles.envelopeFold, styles.envelopeFoldRight]} />
        </View>
      ) : (
        <>
          <View style={styles.lockShackle} />
          <View style={styles.lockBody}><View style={styles.lockKeyhole} /></View>
        </>
      )}
    </View>
  );
}

export function AuthPrimaryButton({ title, onPress, busy }: { title: string; onPress: () => void; busy?: boolean }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} disabled={busy} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, busy && styles.buttonBusy]}>
      {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>{title}</Text>}
    </Pressable>
  );
}

export const authStyles = StyleSheet.create({
  forgot: { color: '#087E83', textAlign: 'right', marginTop: -2, marginBottom: 18, fontWeight: '600', fontSize: 13 },
  footer: { textAlign: 'center', color: '#83918D', marginTop: 22, fontSize: 13 },
  link: { color: '#087E83', fontWeight: '700' },
  back: { color: '#71827D', fontSize: 13, fontWeight: '600', marginBottom: 18 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#C9EEE6' },
  scroll: { flexGrow: 1, paddingBottom: 26 },
  hero: { height: 292, backgroundColor: '#087E83', paddingHorizontal: 30, paddingTop: 54, overflow: 'hidden', borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  decorationOne: { position: 'absolute', width: 112, height: 112, borderRadius: 56, backgroundColor: '#69C8AE', opacity: 0.72, top: -58, left: -26 },
  decorationTwo: { position: 'absolute', width: 92, height: 92, borderRadius: 46, backgroundColor: '#72CCB1', opacity: 0.45, top: 18, left: 24 },
  greeting: { color: '#F5FFFC', fontSize: 38, lineHeight: 44, fontWeight: '700', letterSpacing: -0.8 },
  tagline: { color: '#D4F1EB', fontSize: 14, lineHeight: 20, maxWidth: 230, marginTop: 2 },
  plant: { position: 'absolute', width: 92, height: 152, right: 20, bottom: 6, alignItems: 'center', justifyContent: 'flex-end' },
  stem: { position: 'absolute', width: 3, height: 80, backgroundColor: '#9FE0BF', bottom: 51 },
  leaf: { position: 'absolute', width: 23, height: 69, borderRadius: 24, backgroundColor: '#70C9A5', bottom: 83 },
  leafLeft: { left: 23, transform: [{ rotate: '-27deg' }] },
  leafRight: { right: 20, height: 83, bottom: 74, transform: [{ rotate: '16deg' }] },
  pot: { width: 60, height: 49, backgroundColor: '#F7FBF9', borderBottomLeftRadius: 19, borderBottomRightRadius: 19, transform: [{ perspective: 100 }, { rotateX: '4deg' }] },
  potRim: { position: 'absolute', bottom: 44, width: 64, height: 9, borderRadius: 8, backgroundColor: '#DDEAE6' },
  card: { backgroundColor: '#F5FAF8', borderRadius: 32, marginTop: -42, marginHorizontal: 18, paddingHorizontal: 26, paddingTop: 27, paddingBottom: 26, shadowColor: '#176A68', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  titleWrap: { marginBottom: 21, gap: 5 },
  title: { color: '#087E83', fontSize: 25, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { color: '#82918C', fontSize: 13, lineHeight: 19 },
  inputWrap: { minHeight: 48, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 25, borderWidth: 1, borderColor: '#EAF0EE', paddingHorizontal: 15, marginBottom: 12 },
  iconFrame: { width: 22, height: 22, marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  userHead: { width: 6, height: 6, borderRadius: 3, borderWidth: 1.5, borderColor: '#8AA39D', position: 'absolute', top: 2 },
  userBody: { width: 14, height: 10, borderWidth: 1.5, borderColor: '#8AA39D', borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, position: 'absolute', bottom: 2 },
  envelope: { width: 17, height: 13, borderWidth: 1.5, borderColor: '#8AA39D', borderRadius: 3, overflow: 'hidden' },
  envelopeFold: { position: 'absolute', top: 1, width: 10, height: 10, borderColor: '#8AA39D', borderBottomWidth: 1.3 },
  envelopeFoldLeft: { left: 0, transform: [{ rotate: '34deg' }] },
  envelopeFoldRight: { right: 0, transform: [{ rotate: '-34deg' }] },
  lockShackle: { width: 10, height: 9, borderWidth: 1.5, borderColor: '#8AA39D', borderBottomWidth: 0, borderTopLeftRadius: 6, borderTopRightRadius: 6, position: 'absolute', top: 1 },
  lockBody: { width: 15, height: 12, borderWidth: 1.5, borderColor: '#8AA39D', borderRadius: 3, backgroundColor: '#F5FAF8', position: 'absolute', bottom: 1, alignItems: 'center', justifyContent: 'center' },
  lockKeyhole: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#8AA39D' },
  input: { flex: 1, minHeight: 46, color: '#263631', fontSize: 14, paddingVertical: 9 },
  button: { minHeight: 49, borderRadius: 25, backgroundColor: '#087E83', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 7 },
  buttonPressed: { opacity: 0.84 },
  buttonBusy: { opacity: 0.65 },
  buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});
