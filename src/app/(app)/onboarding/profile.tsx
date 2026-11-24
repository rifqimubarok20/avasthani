import { Redirect } from 'expo-router';

export default function ProfileOnboardingRedirect() {
  return <Redirect href="/(app)/(tabs)/complete-profile" />;
}
