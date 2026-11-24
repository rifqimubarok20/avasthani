import { View, Text, StatusBar } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, paddingTop: 50, paddingHorizontal: 20 }}>
      <StatusBar style="auto" />
      <Text>Avasthani - App is running</Text>
      <Text>Expo Router configuration needs debugging.</Text>
    </View>
  );
}
