// =============================================================================
// Avasthani - Not-found route (Expo Router)
// =============================================================================

import { View } from 'react-native';
import { Text } from '@/components/AppText';
export default function NotFound() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F8F5',
      }}
    >
      <Text>Halaman tidak ditemukan</Text>
    </View>
  );
}
