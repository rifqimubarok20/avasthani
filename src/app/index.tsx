import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/features/auth/AuthProvider';
import { destinationForAccess } from '@/features/auth/access';

export default function Index() {
  const { user, account, loading } = useAuth();
  const [seenOnboarding, setSeenOnboarding] = useState<boolean | null>(null);
  useEffect(() => { void AsyncStorage.getItem('onboarding-complete').then((value) => setSeenOnboarding(value === 'true')).catch(() => setSeenOnboarding(false)); }, []);
  if (loading || seenOnboarding === null) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color="#216E4E" /></View>;
  if (!user && !seenOnboarding) return <Redirect href="/onboarding" />;
  const destination = destinationForAccess({ authenticated: Boolean(user), hasProfile: Boolean(account.profile), role: account.role, userStatus: account.profile?.status, verificationStatus: account.business?.verificationStatus });
  return <Redirect href={destination as never} />;
}
