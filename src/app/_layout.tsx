import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { BiometricGate } from '@/features/auth/BiometricGate';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { FONT_ASSETS } from '@/theme/typography';

// Tahan splash screen sampai font selesai dimuat, supaya teks tidak
// sempat berkedip memakai font sistem.
void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  useEffect(() => {
    if (fontsLoaded || fontError) void SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  // Jika font gagal dimuat, aplikasi tetap jalan dengan font sistem.
  if (!fontsLoaded && !fontError) return null;

  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}

function Root() {
  // StatusBar dan latar navigasi mengikuti tema aktif.
  const { colors, dark } = useTheme();
  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <BiometricGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        />
      </BiometricGate>
    </>
  );
}
