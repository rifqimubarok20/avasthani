import type { ExpoConfig } from 'expo/config';

const googleMapsAndroidApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY;
const googleMapsIosApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_IOS_API_KEY;

const config: ExpoConfig = {
  name: 'Avasthani',
  slug: 'avasthani-app',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.avasthani.app',
    ...(process.env.GOOGLE_SERVICES_IOS_FILE
      ? { googleServicesFile: process.env.GOOGLE_SERVICES_IOS_FILE }
      : {}),
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      backgroundColor: '#E6F4FE',
    },
    package: 'com.avasthani.app',
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    ...(googleMapsAndroidApiKey || googleMapsIosApiKey
      ? [['react-native-maps', {
          ...(googleMapsAndroidApiKey ? { androidGoogleMapsApiKey: googleMapsAndroidApiKey } : {}),
          ...(googleMapsIosApiKey ? { iosGoogleMapsApiKey: googleMapsIosApiKey } : {}),
        }] as [string, { androidGoogleMapsApiKey?: string; iosGoogleMapsApiKey?: string }]]
      : []),
    'expo-secure-store',
    'expo-status-bar',
    ['expo-image-picker', {
      photosPermission: 'Izinkan Avasthani memilih foto produk dari galeri.',
      microphonePermission: false,
    }],
    ['expo-location', {
      locationWhenInUsePermission: 'Izinkan Avasthani menggunakan lokasi saat aplikasi dibuka untuk menampilkan prakiraan cuaca di sekitar Anda.',
    }],
    '@react-native-firebase/crashlytics',
    'react-native-nitro-google-signin',
    './plugins/withNitroGoogleKotlinCompatibility',
  ],
  extra: {
    hasGoogleMapsAndroidApiKey: Boolean(googleMapsAndroidApiKey),
    hasGoogleMapsIosApiKey: Boolean(googleMapsIosApiKey),
  },
};

export default config;
