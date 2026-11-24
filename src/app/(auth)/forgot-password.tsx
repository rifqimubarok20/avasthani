import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { Field, Page, PrimaryButton, Title } from '@/components/ui';
import { getFirebaseAuth } from '@/services/firebase/auth';
import { sendPasswordResetEmail } from '@react-native-firebase/auth';
import { z } from 'zod';
import { useColors } from '@/theme/ThemeProvider';

export default function ForgotPassword() {
  const c = useColors();
  const [email, setEmail] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async () => {
    const parsed = z.string().trim().email('Masukkan email yang valid.').safeParse(email);
    if (!parsed.success) return Alert.alert('Periksa kembali', parsed.error.issues[0]?.message);
    setBusy(true);
    try { await sendPasswordResetEmail(await getFirebaseAuth(), parsed.data); Alert.alert('Email terkirim', 'Jika akun terdaftar, tautan untuk mengatur ulang kata sandi akan dikirim ke email tersebut.'); }
    catch { Alert.alert('Tidak dapat mengirim email', 'Periksa koneksi dan alamat email, lalu coba lagi.'); }
    finally { setBusy(false); }
  };
  return <Page><Title title="Atur ulang kata sandi" subtitle="Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat kata sandi baru." /><Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" /><PrimaryButton title="Kirim tautan" onPress={() => void submit()} busy={busy} /><Link href="/(auth)/login" style={{ textAlign: 'center', color: c.primary, marginTop: 22, fontWeight: '700' }}>Kembali ke masuk</Link></Page>;
}
