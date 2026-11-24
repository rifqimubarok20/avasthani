import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { destinationForAccess } from '@/features/auth/access';
import { useColors } from '@/theme/ThemeProvider';

export default function AuthLayout() {
  const { user, account, loading } = useAuth();
  const c = useColors();
  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={c.primary} /></View>;
  if (user) return <Redirect href={destinationForAccess({ authenticated: true, hasProfile: Boolean(account.profile), role: account.role, userStatus: account.profile?.status, verificationStatus: account.business?.verificationStatus }) as never} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
