import type { SavedWeatherLocation } from './location';

export interface WeatherDay {
  date: string;
  code: number;
  high: number;
  low: number;
  rainChance: number;
}

export interface CityWeather {
  city: string;
  region?: string;
  country?: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  soilMoisture: number | null;
  soilTemperature: number | null;
  code: number;
  updatedAt: string;
  forecast: WeatherDay[];
}

interface GeocodingResponse {
  results?: { name: string; latitude: number; longitude: number; admin1?: string; country?: string }[];
}

interface ForecastResponse {
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    soil_moisture_0_to_1cm?: number | null;
    soil_temperature_0cm?: number | null;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
  };
}

export async function getCityWeather(input: string): Promise<CityWeather> {
  const query = input.trim();
  if (query.length < 2) throw new Error('Masukkan nama kota minimal 2 karakter.');

  const geocodeUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
  geocodeUrl.searchParams.set('name', query);
  geocodeUrl.searchParams.set('count', '1');
  geocodeUrl.searchParams.set('language', 'id');
  geocodeUrl.searchParams.set('countryCode', 'ID');
  const locationResponse = await fetch(geocodeUrl.toString());
  if (!locationResponse.ok) throw new Error('Pencarian lokasi gagal. Coba lagi sebentar.');
  const locationData = await locationResponse.json() as GeocodingResponse;
  const location = locationData.results?.[0];
  if (!location) throw new Error(`Kota "${query}" tidak ditemukan. Periksa ejaan nama kota.`);

  return fetchWeatherAtCoordinates(location.latitude, location.longitude, location.name, location.admin1, location.country);
}

export async function getWeatherAtCoordinates(location: SavedWeatherLocation): Promise<CityWeather> {
  return fetchWeatherAtCoordinates(location.latitude, location.longitude, location.city, location.region, location.country);
}

async function fetchWeatherAtCoordinates(latitude: number, longitude: number, city: string, region?: string, country?: string): Promise<CityWeather> {
  const forecastUrl = new URL('https://api.open-meteo.com/v1/forecast');
  forecastUrl.searchParams.set('latitude', String(latitude));
  forecastUrl.searchParams.set('longitude', String(longitude));
  forecastUrl.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,soil_moisture_0_to_1cm,soil_temperature_0cm');
  forecastUrl.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max');
  forecastUrl.searchParams.set('timezone', 'auto');
  forecastUrl.searchParams.set('forecast_days', '5');
  const weatherResponse = await fetch(forecastUrl.toString());
  if (!weatherResponse.ok) throw new Error('Data cuaca belum dapat dimuat. Periksa koneksi internet.');
  const data = await weatherResponse.json() as ForecastResponse;

  return {
    city,
    ...(region ? { region } : {}),
    ...(country ? { country } : {}),
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    soilMoisture: data.current.soil_moisture_0_to_1cm ?? null,
    soilTemperature: data.current.soil_temperature_0cm ?? null,
    code: data.current.weather_code,
    updatedAt: data.current.time,
    forecast: data.daily.time.map((date, index) => ({
      date,
      code: data.daily.weather_code[index] ?? 0,
      high: data.daily.temperature_2m_max[index] ?? 0,
      low: data.daily.temperature_2m_min[index] ?? 0,
      rainChance: data.daily.precipitation_probability_max[index] ?? 0,
    })),
  };
}

export function describeWeather(code: number) {
  if (code === 0) return { label: 'Cerah', icon: '☀' };
  if (code === 1) return { label: 'Cerah berawan', icon: '🌤' };
  if (code === 2) return { label: 'Berawan sebagian', icon: '⛅' };
  if (code === 3) return { label: 'Berawan', icon: '☁' };
  if (code === 45 || code === 48) return { label: 'Berkabut', icon: '〰' };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Gerimis', icon: '🌦' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Hujan', icon: '🌧' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Hujan salju', icon: '❄' };
  if ([95, 96, 99].includes(code)) return { label: 'Badai petir', icon: '⛈' };
  return { label: 'Kondisi tidak diketahui', icon: '☁' };
}

