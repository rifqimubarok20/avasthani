import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Text } from '@/components/AppText';
import { GoogleAuthButton } from '@/features/auth/GoogleAuthButton';
import { AuthInput, AuthPrimaryButton, AuthScreen, AuthTitle, authStyles } from '@/features/auth/AuthShell';
import { registerSchema } from '@/schemas';
import { getFirebaseAuth } from '@/services/firebase/auth';
import { createUserWithEmailAndPassword, updateProfile } from '@react-native-firebase/auth';

export default function Register() {
  const [fullName, setFullName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async () => {
    const parsed = registerSchema.safeParse({ fullName, email, password, confirmPassword });
    if (!parsed.success) return Alert.alert('Periksa kembali', parsed.error.issues[0]?.message);
    setBusy(true);
    try { const auth = await getFirebaseAuth(); const credential = await createUserWithEmailAndPassword(auth, parsed.data.email, parsed.data.password); await updateProfile(credential.user, { displayName: parsed.data.fullName }); }
    catch (error) { const code = (error as { code?: string })?.code; Alert.alert('Pendaftaran gagal', code === 'auth/email-already-in-use' ? 'Email ini sudah terdaftar. Silakan masuk.' : code === 'auth/network-request-failed' ? 'Periksa koneksi internet, lalu coba lagi.' : 'Tidak dapat membuat akun. Coba lagi.'); }
    finally { setBusy(false); }
  };
  return (
    <AuthScreen>
      <Link href="/(auth)/login" style={authStyles.back}>‹  Kembali ke masuk</Link>
      <AuthTitle title="Daftar" subtitle="Buat akun untuk mulai menggunakan layanan kami." />
      <AuthInput label="Nama lengkap" placeholder="Nama lengkap" icon="user" value={fullName} onChangeText={setFullName} autoComplete="name" textContentType="name" />
      <AuthInput label="Email" placeholder="Email" icon="email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
      <AuthInput label="Kata sandi" placeholder="Kata sandi" icon="lock" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" />
      <AuthInput label="Ulangi kata sandi" placeholder="Ulangi kata sandi" icon="lock" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry autoComplete="new-password" textContentType="newPassword" />
      <AuthPrimaryButton title="Buat akun" onPress={() => void submit()} busy={busy} />
      <GoogleAuthButton title="Daftar dengan Google" />
      <Text style={authStyles.footer}>Sudah punya akun? <Link href="/(auth)/login" style={authStyles.link}>Masuk</Link></Text>
    </AuthScreen>
  );
}
