import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '@/components/AppText';
import { BackButton } from '@/components/BackButton';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Notice, Page } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { getSavedWeatherLocation } from '@/features/weather/location';
import { describeWeather, getCityWeather, getWeatherAtCoordinates, type CityWeather, type WeatherDay } from '@/features/weather/service';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export default function WeatherScreen() {
  const c = useColors();
  const s = styles(c);
  const { account } = useAuth();
  const defaultCity = account.business?.address.city || 'Bandung';
  const [search, setSearch] = useState(defaultCity);
  const [requestedCity, setRequestedCity] = useState(defaultCity);
  const [locationMode, setLocationMode] = useState<'saved' | 'city'>('saved');
  const [refreshToken, setRefreshToken] = useState(0);
  const [weather, setWeather] = useState<CityWeather | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const loadWeather = async () => {
      if (locationMode === 'saved') {
        const savedLocation = await getSavedWeatherLocation();
        if (savedLocation) return getWeatherAtCoordinates(savedLocation);
      }
      return getCityWeather(requestedCity);
    };
    loadWeather().then((result) => {
      if (active) {
        setWeather(result);
        setSelectedDate((current) => result.forecast.some((day) => day.date === current) ? current : result.forecast[0]?.date ?? null);
      }
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : 'Cuaca belum dapat dimuat. Coba lagi.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [requestedCity, locationMode, refreshToken]);

  const submitSearch = () => {
    const city = search.trim();
    if (city) {
      setError('');
      setWeather(null);
      setLoading(true);
      if (locationMode === 'city' && city === requestedCity) setRefreshToken((value) => value + 1);
      else {
        setLocationMode('city');
        setRequestedCity(city);
      }
    }
  };

  const retry = () => {
    setError('');
    setWeather(null);
    setLoading(true);
    setRefreshToken((value) => value + 1);
  };

  const selectedForecast = weather?.forecast.find((day) => day.date === selectedDate) ?? weather?.forecast[0] ?? null;

  return <Page>
    <StatusBar style="light" />
    <SafeAreaView edges={['top']} style={[s.hero, { marginTop: -28, marginHorizontal: -24 }]}>
      <BackButton
        onPress={() => router.back()}
        color={c.onPrimary}
        backgroundColor="rgba(255,255,255,0.18)"
        style={{ marginTop: 12, marginBottom: 20 }}
      />

      {weather ? <>
        <Text style={s.heroEyebrow}>CUACA SAAT INI</Text>
        <View style={s.currentTop}>
          <View style={s.cityWrap}>
            <Text numberOfLines={2} style={s.city}>{weather.city}{weather.region ? `, ${weather.region}` : ''}</Text>
            <Text style={s.country}>{weather.country ?? 'Indonesia'}</Text>
          </View>
          <Text style={s.currentIcon}>{describeWeather(weather.code).icon}</Text>
        </View>
        <Text style={s.temperature}>{Math.round(weather.temperature)}°</Text>
        <Text style={s.condition}>{describeWeather(weather.code).label}</Text>
        <Text style={s.feelsLike}>Terasa seperti {Math.round(weather.feelsLike)}°C</Text>
        <View style={s.metricsRow}>
          <WeatherMetric glyph="≈" label="Kelembapan" value={`${weather.humidity}%`} />
          <View style={s.metricDivider} />
          <WeatherMetric glyph="↗" label="Kecepatan angin" value={`${Math.round(weather.windSpeed)} km/j`} />
        </View>
        <Text style={s.updateTime}>Diperbarui {formatTime(weather.updatedAt)}</Text>
      </> : <View style={s.heroPlaceholder}>
        <Text style={s.heroEyebrow}>CUACA SAAT INI</Text>
        {loading ? <><ActivityIndicator color={c.onPrimary} /><Text style={s.heroLoading}>Memuat cuaca…</Text></> : <Text style={s.heroLoading}>Data cuaca belum tersedia</Text>}
      </View>}
    </SafeAreaView>

    <View style={[s.forecastPanel, { marginHorizontal: -24 }]}>
      <Text style={s.panelTitle}>Cari lokasi</Text>
      <View style={s.searchRow}>
        <TextInput
          accessibilityLabel="Cari nama kota"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
          autoCapitalize="words"
          placeholder="Cari nama kota di Indonesia"
          placeholderTextColor="#829188"
          style={s.input}
        />
        <Pressable accessibilityRole="button" onPress={submitSearch} style={s.searchButton}>
          <Text style={s.searchButtonText}>Cari</Text>
        </Pressable>
      </View>

      {loading ? <View style={s.loading}><ActivityIndicator color={c.primary} /><Text style={s.loadingText}>Memuat prakiraan…</Text></View> : null}
      {!loading && error ? <View style={s.errorBlock}>
        <Notice tone="error">{error}</Notice>
        <Pressable accessibilityRole="button" onPress={retry} style={s.retryButton}><Text style={s.retryText}>Coba lagi</Text></Pressable>
      </View> : null}

      {weather ? <>
        <View style={s.forecastHeader}>
          <Text style={s.sectionTitle}>Prakiraan 5 hari</Text>
          <Text style={s.sectionCaption}>Pilih tanggal untuk melihat rinciannya</Text>
        </View>
        <View style={s.calendarRow}>
          {weather.forecast.map((day, index) => {
            const condition = describeWeather(day.code);
            const selected = day.date === selectedForecast?.date;
            return <Pressable
              key={day.date}
              accessibilityRole="button"
              accessibilityLabel={`${index === 0 ? 'Hari ini' : formatLongDate(day.date)}, ${condition.label}, tertinggi ${Math.round(day.high)} derajat`}
              accessibilityState={{ selected }}
              onPress={() => setSelectedDate(day.date)}
              style={[s.calendarDay, selected && s.calendarDaySelected]}
            >
              <Text numberOfLines={1} style={[s.calendarWeekday, selected && s.calendarTextSelected]}>{index === 0 ? 'Hari ini' : formatDay(day.date)}</Text>
              <Text style={[s.calendarDate, selected && s.calendarTextSelected]}>{formatShortDate(day.date)}</Text>
              <Text style={s.calendarIcon}>{condition.icon}</Text>
              <Text style={[s.calendarTemperature, selected && s.calendarTextSelected]}>{Math.round(day.high)}°</Text>
            </Pressable>;
          })}
        </View>

        {selectedForecast ? <ForecastDetail day={selectedForecast} /> : null}
        <Text style={s.source}>Sumber prakiraan: <Link href="https://open-meteo.com" style={s.sourceLink}>Open-Meteo</Link> · Lokasi: GeoNames</Text>
        <Text style={s.disclaimer}>Prakiraan bersifat indikatif. Kondisi di lahan dapat berbeda.</Text>
      </> : null}
    </View>
  </Page>;
}

function WeatherMetric({ glyph, label, value }: { glyph: string; label: string; value: string }) {
  const c = useColors();
  const s = styles(c);
  return <View style={s.metric}><Text style={s.metricGlyph}>{glyph}</Text><View><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View></View>;
}

function ForecastDetail({ day }: { day: WeatherDay }) {
  const c = useColors();
  const s = styles(c);
  const condition = describeWeather(day.code);
  return <View style={s.detailCard}>
    <Text style={s.detailDate}>{formatLongDate(day.date)}</Text>
    <View style={s.detailConditionRow}>
      <Text style={s.detailIcon}>{condition.icon}</Text>
      <Text style={s.detailCondition}>{condition.label}</Text>
    </View>
    <View style={s.detailMetrics}>
      <ForecastMetric label="Tertinggi" value={`${Math.round(day.high)}°C`} />
      <View style={s.detailDivider} />
      <ForecastMetric label="Terendah" value={`${Math.round(day.low)}°C`} />
      <View style={s.detailDivider} />
      <ForecastMetric label="Peluang hujan" value={`${day.rainChance}%`} />
    </View>
  </View>;
}

function ForecastMetric({ label, value }: { label: string; value: string }) {
  const c = useColors();
  const s = styles(c);
  return <View style={s.forecastMetric}><Text style={s.forecastMetricValue}>{value}</Text><Text style={s.forecastMetricLabel}>{label}</Text></View>;
}

function formatTime(dateTime: string) {
  const date = new Date(dateTime);
  return Number.isNaN(date.getTime()) ? dateTime : date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function parseForecastDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

function formatDay(date: string) {
  const parsed = parseForecastDate(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('id-ID', { weekday: 'short' });
}

function formatShortDate(date: string) {
  const parsed = parseForecastDate(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

function formatLongDate(date: string) {
  const parsed = parseForecastDate(date);
  return Number.isNaN(parsed.getTime()) ? date : parsed.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
}

const styles = (c: Palette) => StyleSheet.create({
  hero: { backgroundColor: '#006F4E', paddingHorizontal: 24, paddingBottom: 36 },
  heroEyebrow: { color: '#CDE8DA', fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 9 },
  currentTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, cityWrap: { flex: 1, paddingRight: 10 },
  city: { color: c.onPrimary, fontWeight: '800', fontSize: 21, lineHeight: 27 }, country: { color: '#D8EEE3', fontSize: 13, marginTop: 4 }, currentIcon: { color: '#FFF3CA', fontSize: 48 },
  temperature: { color: c.onPrimary, fontSize: 70, lineHeight: 78, fontWeight: '300', letterSpacing: -2, marginTop: 4 },
  condition: { color: c.onPrimary, fontSize: 18, fontWeight: '800' }, feelsLike: { color: '#D8EEE3', fontSize: 13, marginTop: 4 },
  metricsRow: { flexDirection: 'row', alignItems: 'center', gap: 18, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.28)', paddingTop: 16, marginTop: 20 },
  metric: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 }, metricGlyph: { color: '#D8EEE3', fontSize: 21, fontWeight: '700' }, metricValue: { color: c.onPrimary, fontWeight: '800', fontSize: 14 }, metricLabel: { color: '#D8EEE3', fontSize: 11, marginTop: 3 }, metricDivider: { height: 34, width: 1, backgroundColor: 'rgba(255,255,255,0.28)' },
  updateTime: { color: '#D8EEE3', fontSize: 10, textAlign: 'right', marginTop: 15 }, heroPlaceholder: { minHeight: 210 }, heroLoading: { color: c.onPrimary, fontSize: 14, marginTop: 14 },
  forecastPanel: { marginTop: -28, paddingHorizontal: 24, paddingTop: 30, paddingBottom: 40, borderTopLeftRadius: 32, borderTopRightRadius: 32, backgroundColor: c.background },
  panelTitle: { color: c.textPrimary, fontSize: 14, fontWeight: '800', marginBottom: 9 },
  searchRow: { flexDirection: 'row', gap: 9, marginBottom: 24 }, input: { flex: 1, minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, paddingHorizontal: 15, color: c.textPrimary, fontSize: 14 },
  searchButton: { minWidth: 68, borderRadius: 16, backgroundColor: c.primary, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 }, searchButtonText: { color: c.onPrimary, fontWeight: '800', fontSize: 14 },
  loading: { minHeight: 100, alignItems: 'center', justifyContent: 'center', gap: 11 }, loadingText: { color: c.textSecondary, fontSize: 13 }, errorBlock: { marginBottom: 20 }, retryButton: { minHeight: 44, borderRadius: 13, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', marginTop: 8 }, retryText: { color: c.onPrimary, fontWeight: '800' },
  forecastHeader: { marginBottom: 14 }, sectionTitle: { color: c.textPrimary, fontSize: 20, fontWeight: '800' }, sectionCaption: { color: c.textSecondary, fontSize: 12, marginTop: 4 },
  calendarRow: { flexDirection: 'row', gap: 7, marginBottom: 14 }, calendarDay: { flex: 1, minWidth: 0, minHeight: 105, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, paddingVertical: 9, borderRadius: 17, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
  calendarDaySelected: { backgroundColor: c.primary, borderColor: c.primary }, calendarWeekday: { color: c.textSecondary, fontWeight: '700', fontSize: 9 }, calendarDate: { color: c.textPrimary, fontWeight: '800', fontSize: 10, marginTop: 2 }, calendarIcon: { fontSize: 19, marginTop: 4 }, calendarTemperature: { color: c.textPrimary, fontWeight: '800', fontSize: 11, marginTop: 3 }, calendarTextSelected: { color: c.onPrimary },
  detailCard: { padding: 16, borderRadius: 21, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }, detailDate: { color: c.textSecondary, fontSize: 12, fontWeight: '700' }, detailConditionRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 5 }, detailIcon: { fontSize: 27 }, detailCondition: { color: c.textPrimary, fontSize: 18, fontWeight: '800' },
  detailMetrics: { flexDirection: 'row', alignItems: 'center', marginTop: 15, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E9EFEB' }, forecastMetric: { flex: 1, alignItems: 'center' }, forecastMetricValue: { color: c.textPrimary, fontWeight: '800', fontSize: 14 }, forecastMetricLabel: { color: c.textSecondary, fontSize: 9, marginTop: 4, textAlign: 'center' }, detailDivider: { height: 30, width: 1, backgroundColor: '#E9EFEB' },
  source: { color: c.textSecondary, fontSize: 10, marginTop: 17 }, sourceLink: { color: c.primary, textDecorationLine: 'underline', fontWeight: '700' }, disclaimer: { color: c.textSecondary, fontSize: 10, marginTop: 5 },
});
