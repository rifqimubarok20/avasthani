import { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { Text } from '@/components/AppText';
import { Link, useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Page } from '@/components/ui';
import { useAuth } from '@/features/auth/AuthProvider';
import { listApprovedProducts, listCategories } from '@/features/catalog/service';
import { getSavedWeatherLocation, saveWeatherLocation, type SavedWeatherLocation } from '@/features/weather/location';
import { describeWeather, getCityWeather, getWeatherAtCoordinates, type CityWeather } from '@/features/weather/service';
import { formatNewsAge, NEWS_ARTICLES } from '@/features/news/data';
import type { Category, Product } from '@/types';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

export default function HomeTab() {
  const c = useColors();
  const s = styles(c);
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { user, account } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [weatherLocation, setWeatherLocation] = useState<SavedWeatherLocation | null>(null);
  const [weatherSummary, setWeatherSummary] = useState<CityWeather | null>(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [scrolledIntoContent, setScrolledIntoContent] = useState(false);
  const firstName = account.profile?.displayName?.split(' ')[0] ?? user?.displayName?.split(' ')[0] ?? 'Teman';
  const defaultWeatherCity = account.business?.address.city;
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextScrolledIntoContent = event.nativeEvent.contentOffset.y >= 324;
    setScrolledIntoContent((current) => current === nextScrolledIntoContent ? current : nextScrolledIntoContent);
  };

  useEffect(() => {
    let active = true;
    Promise.all([listApprovedProducts(), listCategories()]).then(([items, groups]) => {
      if (!active) return;
      setProducts(items);
      setCategories(groups);
    }).catch((error: unknown) => {
      // Home remains usable when the catalogue is temporarily unavailable.
      console.warn('Ringkasan katalog belum dapat dimuat.', error);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const loadWeather = weatherLocation
      ? getWeatherAtCoordinates(weatherLocation)
      : defaultWeatherCity ? getCityWeather(defaultWeatherCity) : Promise.resolve(null);
    loadWeather.then((result) => {
      if (active && result) setWeatherSummary(result);
    }).catch((error: unknown) => console.warn('Ringkasan cuaca belum dapat dimuat.', error));
    return () => { active = false; };
  }, [weatherLocation, defaultWeatherCity]);

  useEffect(() => {
    let active = true;
    getSavedWeatherLocation().then((location) => {
      if (active) setWeatherLocation(location);
    }).catch((error: unknown) => console.warn('Lokasi tersimpan belum dapat dibaca.', error));
    return () => { active = false; };
  }, []);

  const enableLocation = async () => {
    if (locationBusy) return;
    setLocationBusy(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin lokasi belum diberikan', 'Izinkan akses lokasi saat menggunakan aplikasi melalui pengaturan perangkat untuk melihat prakiraan cuaca di sekitar Anda.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      const city = place?.city || place?.subregion || place?.district || place?.region || 'Lokasi saya';
      const region = place?.region && place.region !== city ? place.region : undefined;
      const savedLocation: SavedWeatherLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city,
        ...(region ? { region } : {}),
        ...(place?.country ? { country: place.country } : {}),
      };
      await saveWeatherLocation(savedLocation);
      setWeatherLocation(savedLocation);
    } catch (error) {
      console.error('Lokasi perangkat gagal diperoleh.', error);
      Alert.alert('Lokasi belum tersedia', 'Pastikan layanan lokasi perangkat aktif, lalu coba lagi.');
    } finally {
      setLocationBusy(false);
    }
  };

  return <Page bottomPadding={0} onScroll={handleScroll}>
    {isFocused ? <StatusBar style={scrolledIntoContent ? 'dark' : 'light'} animated /> : null}
    <View style={[s.hero, { marginTop: -(insets.top + 28), marginHorizontal: -24, paddingTop: insets.top + 12 }]}>
      <Image source={require('../../../../assets/home-farm-hero-tall.jpg')} style={s.heroImage} resizeMode="cover" accessibilityLabel="Lanskap pertanian Indonesia" />
      <View style={s.heroShade} />
      <View style={s.heroTopBar}>
        <View style={s.greeting}>
          <Text style={s.name}>Halo, {firstName}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={weatherLocation ? `Perbarui lokasi, ${weatherLocation.city}` : 'Izinkan akses lokasi'} onPress={() => void enableLocation()} disabled={locationBusy} style={s.locationButton}>
            <Text style={s.locationGlyph}>⌖</Text>
            <Text numberOfLines={1} style={s.locationText}>{locationBusy ? 'Mendeteksi lokasi…' : weatherLocation ? `${weatherLocation.city}${weatherLocation.region ? `, ${weatherLocation.region}` : ''} · Perbarui` : 'Izinkan lokasi'}</Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifikasi" onPress={() => Alert.alert('Notifikasi', 'Belum ada notifikasi baru.')} style={s.bell}>
          <View style={s.bellShape}><View style={s.bellClapper} /></View>
        </Pressable>
      </View>
    </View>

    <Link href="/(app)/weather" asChild>
      <Pressable accessibilityRole="button" accessibilityLabel="Buka informasi cuaca detail" style={s.weatherCard}>
        <Image source={require('../../../../assets/weather-card-bg.jpg')} style={StyleSheet.absoluteFill} resizeMode="cover" accessible={false} />
        <View pointerEvents="none" style={s.weatherImageTint} />
        <View style={s.weatherCardTop}>
          <View style={s.weatherMain}>
            <Text numberOfLines={1} style={s.weatherLocation}>{weatherSummary?.city ?? weatherLocation?.city ?? defaultWeatherCity ?? 'Cuaca sekitar'}</Text>
            <Text style={s.weatherTemperature}>{weatherSummary ? `${Math.round(weatherSummary.temperature)}°C` : '—°C'}</Text>
            <Text style={s.weatherCondition}>{weatherSummary ? describeWeather(weatherSummary.code).label : 'Atur lokasi untuk melihat cuaca'}</Text>
          </View>
          <View style={s.weatherIllustration}><Text style={s.weatherIllustrationText}>{weatherSummary ? describeWeather(weatherSummary.code).icon : '☀️'}</Text></View>
        </View>
        <View style={s.weatherMetrics}>
          <WeatherSummaryMetric label="Kelembapan" value={weatherSummary ? `${Math.round(weatherSummary.humidity)}%` : '—'} hint="Udara" />
          <View style={s.weatherMetricDivider} />
          <WeatherSummaryMetric label="Kondisi tanah" value={weatherSummary?.soilMoisture != null ? `${Math.round(weatherSummary.soilMoisture * 100)}%` : '—'} hint={weatherSummary?.soilMoisture != null ? 'Indikatif' : 'Belum ada data'} />
          <View style={s.weatherMetricDivider} />
          <WeatherSummaryMetric label="Peluang hujan" value={weatherSummary?.forecast[0] ? `${weatherSummary.forecast[0].rainChance}%` : '—'} hint="Hari ini" />
        </View>
      </Pressable>
    </Link>

    <View style={[s.contentPanel, { paddingBottom: insets.bottom + 92 }]}>
    <View style={s.toolsHeading}>
      <View><Text style={s.sectionTitle}>Alat</Text><Text style={s.sectionCaption}>Fitur untuk mendukung aktivitas tani</Text></View>
    </View>
    <View style={s.toolsGrid}>
      <View style={s.toolsRow}>
        <ToolTile glyph="🌤️" label="Cuaca" description="Prakiraan di lokasi Anda" tint="#E7F3FA" href="/(app)/weather" />
        <ToolTile glyph="🧮" label="Kalkulator pemupukan" description="Hitung kebutuhan pupuk" tint="#E8F3E6" href="/(app)/fertilizer-calculator" />
      </View>
      <View style={s.toolsRow}>
        <ToolTile glyph="🌾" label="Produk" description="Cari hasil pertanian" tint="#FFF0D5" href="/(app)/(tabs)/products" />
        <ToolTile glyph="✨" label="Avastha AI" description="Asisten pertanian" tint="#F1E8F8" />
      </View>
    </View>

    <View style={[s.sectionHeader, s.newsHeader]}>
      <View><Text style={s.sectionTitle}>Berita</Text><Text style={s.sectionCaption}>Wawasan untuk kegiatan pertanian Anda</Text></View>
      <Link href="/(app)/news" style={s.seeAll}>Lihat semua</Link>
    </View>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      decelerationRate="fast"
      snapToInterval={144}
      snapToAlignment="start"
      style={s.newsScroll}
      contentContainerStyle={s.newsRail}
    >
      {NEWS_ARTICLES.slice(0, 6).map((item) => (
        <View key={item.id} style={s.newsCard}>
          <View style={[s.newsArtwork, { backgroundColor: item.tint }]}>
            <Text style={s.newsGlyph}>{item.glyph}</Text>
            <View style={s.newsCategory}><Text style={s.newsCategoryText}>{item.category}</Text></View>
          </View>
          <View style={s.newsCopy}>
            <Text numberOfLines={3} style={s.newsTitle}>{item.title}</Text>
            <Text style={s.newsReadTime}>{formatNewsAge(item.publishedAt)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>

    <View style={[s.sectionHeader, s.productHeader]}>
      <View><Text style={s.sectionTitle}>Pilih produk</Text><Text style={s.sectionCaption}>Hasil tani dari pemasok terverifikasi</Text></View>
      <Link href="/(app)/(tabs)/products" style={s.seeAll}>Lihat semua</Link>
    </View>
    {products.length > 0 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.productRail}>{products.slice(0, 6).map((product) => {
      const category = categories.find((item) => item.id === product.categoryId)?.name ?? 'Hasil tani';
      return <Link key={product.id} href={{ pathname: '/(app)/catalog/[productId]', params: { productId: product.id } }} asChild>
        <Pressable accessibilityRole="button" style={s.productCard}>
          {product.images[0] ? <Image source={{ uri: product.images[0] }} style={s.productImage} resizeMode="cover" /> : <View style={[s.productImage, s.productPlaceholder]}><Text style={s.placeholderGlyph}>🌿</Text></View>}
          <Text numberOfLines={1} style={s.productCategory}>{category}</Text>
          <Text numberOfLines={1} style={s.productName}>{product.name}</Text>
          <Text numberOfLines={1} style={s.productLocation}>{product.location.city}</Text>
        </Pressable>
      </Link>;
    })}</ScrollView> : <Link href="/(app)/(tabs)/products" asChild><Pressable accessibilityRole="button" style={s.emptyProducts}><Text style={s.emptyIcon}>🌱</Text><View style={{ flex: 1 }}><Text style={s.quickTitle}>Lihat katalog produk</Text><Text style={s.quickSubtitle}>Produk yang disetujui akan tampil di sini.</Text></View><Text style={s.chevron}>›</Text></Pressable></Link>}
    </View>
  </Page>;
}

function ToolTile({ glyph, label, description, tint, href }: { glyph: string; label: string; description: string; tint: string; href?: '/(app)/(tabs)/products' | '/(app)/weather' | '/(app)/fertilizer-calculator' }) {
  const c = useColors();
  const s = styles(c);
  const content = <>
    <View style={[s.toolIcon, { backgroundColor: tint }]}><Text style={s.toolGlyph}>{glyph}</Text></View>
    <Text numberOfLines={2} style={s.toolTitle}>{label}</Text>
    <Text numberOfLines={1} style={s.toolDescription}>{href ? description : 'Segera hadir'}</Text>
  </>;
  return href
    ? <Link href={href} asChild><Pressable accessibilityRole="button" style={s.toolTile}>{content}</Pressable></Link>
    : <View style={s.toolTile}>{content}</View>;
}

function WeatherSummaryMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
  const c = useColors();
  const s = styles(c);
  return <View style={s.weatherMetric}>
    <Text numberOfLines={1} style={s.weatherMetricLabel}>{label}</Text>
    <Text numberOfLines={1} style={s.weatherMetricValue}>{value}</Text>
    <Text numberOfLines={1} style={s.weatherMetricHint}>{hint}</Text>
  </View>;
}

const styles = (c: Palette) => StyleSheet.create({
  heroTopBar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 19, paddingTop: 20 },
  greeting: { flex: 1, paddingRight: 8 }, kicker: { color: '#E5F3DD', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  name: { color: c.onPrimary, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  locationButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, marginTop: 4, minHeight: 24 }, locationGlyph: { color: c.onPrimary, fontSize: 17, fontWeight: '800' }, locationText: { color: '#F1F7EE', fontSize: 12, fontWeight: '700' },
  bell: { height: 46, width: 46, borderRadius: 23, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  bellShape: { width: 19, height: 18, borderWidth: 1.8, borderColor: c.primary, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 2 },
  bellClapper: { height: 2, width: 21, borderRadius: 2, backgroundColor: c.primary, position: 'absolute', bottom: -4 },
  hero: { height: 440, overflow: 'hidden', backgroundColor: '#5D9E79', marginBottom: 0, justifyContent: 'flex-start' }, heroImage: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '100%' },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 38, 28, 0.24)' },
  contentPanel: { marginTop: -34, marginHorizontal: -24, paddingHorizontal: 24, paddingTop: 54, backgroundColor: c.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, overflow: 'hidden', zIndex: 1 },
  weatherCard: { marginTop: -202, marginBottom: 0, padding: 16, minHeight: 158, backgroundColor: '#F8D88F', borderRadius: 25, position: 'relative', zIndex: 2, overflow: 'hidden' },
  weatherImageTint: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(255, 219, 143, 0.22)' },
  weatherCardTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', minHeight: 83 },
  weatherMain: { flex: 1, minWidth: 0, paddingRight: 8 }, weatherLocation: { color: '#6F4A18', fontSize: 12, fontWeight: '700' }, weatherTemperature: { color: '#583A16', fontSize: 29, lineHeight: 34, fontWeight: '800', marginTop: 1 }, weatherCondition: { color: '#806637', fontSize: 12, marginTop: 1 },
  weatherIllustration: { width: 94, height: 54, alignItems: 'center', justifyContent: 'center' }, weatherIllustrationText: { fontSize: 48 },
  weatherMetrics: { flexDirection: 'row', alignItems: 'stretch', borderTopWidth: 1, borderTopColor: 'rgba(113, 83, 34, 0.18)', paddingTop: 10, gap: 7, backgroundColor: 'rgba(255, 248, 230, 0.82)', marginHorizontal: -16, marginBottom: -16, paddingHorizontal: 16, paddingBottom: 12 },
  weatherMetric: { flex: 1, minWidth: 0, alignItems: 'center' }, weatherMetricLabel: { color: '#806637', fontSize: 9, fontWeight: '600', textAlign: 'center' }, weatherMetricValue: { color: '#593D17', fontSize: 14, fontWeight: '800', marginTop: 3 }, weatherMetricHint: { color: '#806637', fontSize: 9, marginTop: 1 },
  weatherMetricDivider: { width: 1, backgroundColor: 'rgba(113, 83, 34, 0.16)', marginVertical: 3 },
  toolsHeading: { marginBottom: 11 }, toolsGrid: { backgroundColor: '#F8F4EF', borderRadius: 26, padding: 12, gap: 12, marginBottom: 25 }, toolsRow: { flexDirection: 'row', gap: 12 },
  toolTile: { flex: 1, minHeight: 148, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 15, backgroundColor: c.surface, borderRadius: 22 },
  toolIcon: { height: 64, width: 64, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, toolGlyph: { fontSize: 34 }, toolTitle: { color: c.textPrimary, fontWeight: '800', fontSize: 14, textAlign: 'center', minHeight: 36, textAlignVertical: 'center' }, toolDescription: { color: c.textSecondary, fontSize: 10, marginTop: 2, textAlign: 'center' },
  sectionHeader: { marginBottom: 11 }, sectionTitle: { color: c.textPrimary, fontSize: 18, fontWeight: '800', letterSpacing: -0.2 }, sectionCaption: { color: c.textSecondary, fontSize: 12, marginTop: 3 },
  newsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 1, marginBottom: 12 }, newsScroll: { marginBottom: 23 }, newsRail: { flexDirection: 'row', gap: 12, paddingRight: 24, paddingBottom: 4 },
  newsCard: { width: 132, minHeight: 190, overflow: 'hidden', borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border },
  newsArtwork: { height: 78, alignItems: 'center', justifyContent: 'center', position: 'relative' }, newsGlyph: { fontSize: 38 },
  newsCategory: { position: 'absolute', left: 8, bottom: 7, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.9)' }, newsCategoryText: { color: c.primaryDark, fontSize: 8, fontWeight: '800', letterSpacing: 0.6 },
  newsCopy: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 10, paddingTop: 9, paddingBottom: 10 }, newsTitle: { color: c.textPrimary, fontSize: 12, lineHeight: 16, fontWeight: '800' }, newsReadTime: { color: c.textSecondary, fontSize: 9, marginTop: 9 },
  quickTitle: { color: c.textPrimary, fontWeight: '800', fontSize: 13 }, quickSubtitle: { color: c.textSecondary, fontSize: 11, marginTop: 4 }, chevron: { color: '#91A39A', fontSize: 25 },
  productHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }, seeAll: { color: c.primary, fontSize: 12, fontWeight: '800' },
  productRail: { flexDirection: 'row', gap: 12, paddingBottom: 6 }, productCard: { width: 190, overflow: 'hidden', borderRadius: 16, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, paddingBottom: 12 },
  productImage: { width: '100%', height: 125, backgroundColor: c.primarySoft }, productPlaceholder: { alignItems: 'center', justifyContent: 'center' }, placeholderGlyph: { fontSize: 36 }, productCategory: { color: c.primary, fontSize: 10, fontWeight: '700', marginHorizontal: 11, marginTop: 10 }, productName: { color: c.textPrimary, fontSize: 14, fontWeight: '800', marginHorizontal: 11, marginTop: 4 }, productLocation: { color: c.textSecondary, fontSize: 11, marginHorizontal: 11, marginTop: 4 },
  emptyProducts: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 15 }, emptyIcon: { fontSize: 30 },
});
