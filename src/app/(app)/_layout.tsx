import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { destinationForAccess, roleAllows } from '@/features/auth/access';

export default function AppLayout() {
  const { user, account, loading } = useAuth();
  const segments = useSegments();
  const roleArea = segments.find((segment) => segment === 'buyer' || segment === 'supplier' || segment === 'operator');
  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color="#216E4E" /></View>;
  if (!user) return <Redirect href="/(auth)/login" />;
  const destination = destinationForAccess({ authenticated: true, hasProfile: Boolean(account.profile), role: account.role, userStatus: account.profile?.status, verificationStatus: account.business?.verificationStatus });
  const inOperatorArea = segments.includes('operator');
  if (destination === '/(app)/account-status' && !segments.includes('account-status')) {
    return <Redirect href="/(app)/account-status" />;
  }
  if (inOperatorArea && account.role !== 'SUPER_ADMIN' && account.role !== 'OPERATOR') return <Redirect href="/(app)/(tabs)/home" />;
  if (roleArea === 'supplier' && (account.business?.verificationStatus !== 'VERIFIED' || account.profile?.status !== 'ACTIVE')) {
    return <Redirect href="/(app)/(tabs)/profile" />;
  }
  if (roleArea && !roleAllows(account.role, roleArea === 'operator' ? 'OPERATOR' : roleArea === 'buyer' ? 'BUYER' : 'SUPPLIER')) return <Redirect href="/(app)" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
