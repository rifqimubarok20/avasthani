import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Text } from '@/components/AppText';
import { GoogleAuthButton } from '@/features/auth/GoogleAuthButton';
import { AuthInput, AuthPrimaryButton, AuthScreen, AuthTitle, authStyles } from '@/features/auth/AuthShell';
import { getFirebaseAuth } from '@/services/firebase/auth';
import { signInWithEmailAndPassword } from '@react-native-firebase/auth';
import { loginSchema } from '@/schemas';

export default function Login() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) return Alert.alert('Periksa kembali', parsed.error.issues[0]?.message);
    setBusy(true);
    try { await signInWithEmailAndPassword(await getFirebaseAuth(), parsed.data.email, parsed.data.password); }
    catch (error) { Alert.alert('Tidak dapat masuk', authError(error)); }
    finally { setBusy(false); }
  };
  return (
    <AuthScreen>
      <AuthTitle title="Masuk" subtitle="Selamat datang kembali. Silakan masuk ke akun Anda." />
      <AuthInput label="Email" placeholder="Email" icon="email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      <AuthInput label="Kata sandi" placeholder="Kata sandi" icon="lock" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" textContentType="password" />
      <Link href="/(auth)/forgot-password" style={authStyles.forgot}>Lupa kata sandi?</Link>
      <AuthPrimaryButton title="Masuk" onPress={() => void submit()} busy={busy} />
      <GoogleAuthButton title="Masuk dengan Google" />
      <Text style={authStyles.footer}>Belum punya akun? <Link href="/(auth)/register" style={authStyles.link}>Daftar</Link></Text>
    </AuthScreen>
  );
}

function authError(error: unknown) {
  const code = (error as { code?: string })?.code;
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'Email atau kata sandi tidak sesuai.';
  if (code === 'auth/network-request-failed') return 'Periksa koneksi internet, lalu coba lagi.';
  if (code === 'auth/too-many-requests') return 'Terlalu banyak percobaan. Coba lagi beberapa saat.';
  return 'Terjadi kendala saat masuk. Coba lagi.';
}
