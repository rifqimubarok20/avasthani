import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@avasthani/weather-location';

export interface SavedWeatherLocation {
  latitude: number;
  longitude: number;
  city: string;
  region?: string;
  country?: string;
}

export async function saveWeatherLocation(location: SavedWeatherLocation) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location));
}

export async function getSavedWeatherLocation(): Promise<SavedWeatherLocation | null> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const value = JSON.parse(stored) as SavedWeatherLocation;
    if (typeof value.latitude !== 'number' || typeof value.longitude !== 'number' || typeof value.city !== 'string') return null;
    return value;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }
}
