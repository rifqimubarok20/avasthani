import { Redirect } from 'expo-router';

export default function CatalogRedirect() {
  return <Redirect href="/(app)/(tabs)/products" />;
}
