import { requireOptionalNativeModule } from 'expo-modules-core';

export interface PlacePrediction {
  placeId: string;
  primaryText: string;
  secondaryText: string;
  fullText: string;
}

export interface PlaceLocation {
  latitude: number;
  longitude: number;
  address: string;
}

interface FarmPlacesNativeModule {
  autocomplete(query: string): Promise<PlacePrediction[]>;
  fetchPlace(placeId: string): Promise<PlaceLocation>;
  resetSession(): Promise<void>;
}

export const farmPlaces = requireOptionalNativeModule<FarmPlacesNativeModule>('FarmPlaces');
