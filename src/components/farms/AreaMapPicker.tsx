import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactElement, type Ref } from 'react';
import { ActivityIndicator, Alert, Keyboard, Modal, Platform, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Text, TextInput } from '@/components/AppText';
import { BackButton } from '@/components/BackButton';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, type MapPressEvent } from 'react-native-maps';
import WebView, { type WebViewMessageEvent } from 'react-native-webview';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';
import { farmPlaces } from '@/features/farms/places';

export interface MeasuredArea {
  latitude: number;
  longitude: number;
  areaHectares: number;
  boundary: [number, number][];
}

interface Props {
  visible: boolean;
  initialCenter?: { latitude: number; longitude: number };
  initialBoundary?: [number, number][];
  onClose: () => void;
  onConfirm: (measurement: MeasuredArea) => void;
}

const DEFAULT_CENTER = { latitude: -6.2088, longitude: 106.8456 };
const APP_CONTACT = 'avasthapurnakarya@gmail.com';
type MapWebViewHandle = { injectJavaScript: (script: string) => void };
type MapWebViewProps = {
  ref?: Ref<MapWebViewHandle>;
  originWhitelist: string[];
  source: { html: string };
  onMessage: (event: WebViewMessageEvent) => void;
  onLoadEnd: () => void;
  javaScriptEnabled: boolean;
  domStorageEnabled: boolean;
  setSupportMultipleWindows: boolean;
  applicationNameForUserAgent: string;
  style: StyleProp<ViewStyle>;
  renderLoading: () => ReactElement;
  startInLoadingState: boolean;
};
const CompatibleWebView = WebView as unknown as ComponentType<MapWebViewProps>;

interface AddressSuggestion {
  id: string;
  label: string;
  detail: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

interface PhotonFeature {
  properties?: {
    osm_id?: number;
    name?: string;
    street?: string;
    district?: string;
    locality?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
  geometry?: { coordinates?: number[] };
}

export function AreaMapPicker({ visible, initialCenter, initialBoundary, onClose, onConfirm }: Props) {
  const c = useColors();
  const s = styles(c);
  const [points, setPoints] = useState<[number, number][]>(initialBoundary ?? []);
  const [areaHectares, setAreaHectares] = useState(() => calculatePolygonArea(initialBoundary ?? []) / 10_000);
  const [searchText, setSearchText] = useState('');
  const [searchBusy, setSearchBusy] = useState(false);
  const [suggestionsBusy, setSuggestionsBusy] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [suggestionsQuery, setSuggestionsQuery] = useState('');
  const [suggestionsError, setSuggestionsError] = useState('');
  const [locationBusy, setLocationBusy] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [centerTarget, setCenterTarget] = useState<{ latitude: number; longitude: number } | null>(null);
  const webViewRef = useRef<MapWebViewHandle>(null);
  const mapViewRef = useRef<MapView>(null);
  const lastSearchAt = useRef(0);
  const zoomLevel = useRef(16);
  const selectedLocationLabel = useRef<string | null>(null);
  const searchCache = useRef(new Map<string, { latitude: number; longitude: number }>());
  const center = initialCenter ?? DEFAULT_CENTER;
  const hasGoogleMapsKey = Platform.OS === 'android'
    ? Constants.expoConfig?.extra?.hasGoogleMapsAndroidApiKey === true
    : Platform.OS === 'ios' && Constants.expoConfig?.extra?.hasGoogleMapsIosApiKey === true;
  const html = useMemo(() => createMapHtml(center.latitude, center.longitude), [center.latitude, center.longitude]);

  useEffect(() => {
    const query = searchText.trim();
    if (!visible || query.length < 3 || query === selectedLocationLabel.current) return;

    const controller = new AbortController();
    const debounce = setTimeout(() => {
      setSuggestionsQuery(query);
      setSuggestions([]);
      setSuggestionsError('');
      setSuggestionsBusy(true);
      void (async () => {
        const wait = Math.max(0, 1000 - (currentTime() - lastSearchAt.current));
        if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
        if (controller.signal.aborted) return;
        lastSearchAt.current = currentTime();
        try {
          const results = Platform.OS === 'android'
            ? await fetchGooglePlaceSuggestions(query)
            : await fetchAddressSuggestions(query, 5, controller.signal);
          if (!controller.signal.aborted) setSuggestions(results);
        } catch (error) {
          if (!controller.signal.aborted) {
            console.warn('Saran lokasi tidak dapat dimuat.', error);
            setSuggestionsError(formatPlacesError(error));
          }
        } finally {
          if (!controller.signal.aborted) setSuggestionsBusy(false);
        }
      })();
    }, 500);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [searchText, visible]);

  useEffect(() => {
    if (!centerTarget) return;
    const { latitude, longitude } = centerTarget;
    if (hasGoogleMapsKey) {
      mapViewRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 450);
    } else if (mapReady) {
      webViewRef.current?.injectJavaScript(`window.centerFarmMap && window.centerFarmMap(${latitude},${longitude},16); true;`);
    }
  }, [centerTarget, hasGoogleMapsKey, mapReady]);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as { points?: [number, number][]; area?: number; error?: string };
      if (payload.error) {
        Alert.alert('Peta tidak dapat dimuat', 'Periksa koneksi internet dan konfigurasi layanan peta.');
        return;
      }
      setPoints(Array.isArray(payload.points) ? payload.points : []);
      setAreaHectares(typeof payload.area === 'number' ? payload.area / 10_000 : 0);
    } catch {
      // Ignore malformed map messages; the WebView may still be initializing.
    }
  };

  const addMapPoint = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const next = [...points, [latitude, longitude] as [number, number]];
    setPoints(next);
    setAreaHectares(calculatePolygonArea(next) / 10_000);
  };

  const clearPoints = () => {
    setPoints([]);
    setAreaHectares(0);
    webViewRef.current?.injectJavaScript('window.clearFarmPoints && window.clearFarmPoints(); true;');
  };

  const confirm = () => {
    if (points.length < 3 || areaHectares <= 0) return;
    const latitude = points.reduce((sum, point) => sum + point[0], 0) / points.length;
    const longitude = points.reduce((sum, point) => sum + point[1], 0) / points.length;
    onConfirm({ latitude, longitude, areaHectares, boundary: points });
    clearPoints();
  };

  const searchLocation = async () => {
    const query = searchText.trim();
    if (query.length < 3 || searchBusy) return;
    Keyboard.dismiss();
    setSearchBusy(true);
    try {
      const cacheKey = query.toLocaleLowerCase('id-ID');
      const cached = searchCache.current.get(cacheKey);
      if (cached) {
        setCenterTarget(cached);
        setSuggestions([]);
        setSuggestionsQuery('');
        return;
      }
      const matchingSuggestion = suggestionsQuery === query ? suggestions[0] : undefined;
      if (matchingSuggestion) {
        await applySuggestion(matchingSuggestion);
        return;
      }
      if (Platform.OS === 'android') {
        const results = await fetchGooglePlaceSuggestions(query);
        if (!results.length) {
          Alert.alert('Lokasi tidak ditemukan', 'Coba masukkan nama desa, kecamatan, atau kota yang lebih spesifik.');
          return;
        }
        setSuggestions(results);
        setSuggestionsQuery(query);
        Alert.alert('Pilih alamat', 'Ketuk salah satu saran alamat yang muncul di bawah kolom pencarian.');
        return;
      }
      const wait = Math.max(0, 1000 - (currentTime() - lastSearchAt.current));
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      lastSearchAt.current = currentTime();
      let result: AddressSuggestion | undefined;
      try {
        result = (await fetchAddressSuggestions(query, 1))[0];
      } catch (photonError) {
        console.warn('Photon search unavailable; trying one-time address lookup.', photonError);
      }
      if (!result) result = await fetchSingleAddress(query);
      if (!result) {
        Alert.alert('Lokasi tidak ditemukan', 'Coba masukkan nama desa, kecamatan, atau kota yang lebih spesifik.');
        return;
      }
      if (result.latitude === undefined || result.longitude === undefined) {
        throw new Error('Koordinat lokasi tidak tersedia.');
      }
      searchCache.current.set(cacheKey, { latitude: result.latitude, longitude: result.longitude });
      selectedLocationLabel.current = result.label;
      setSearchText(result.label);
      setSuggestions([]);
      setSuggestionsQuery('');
      setCenterTarget({ latitude: result.latitude, longitude: result.longitude });
    } catch (error) {
      console.warn('Pencarian lokasi peta gagal.', error);
      Alert.alert('Pencarian lokasi belum berhasil', formatPlacesError(error));
    } finally {
      setSearchBusy(false);
    }
  };

  const applySuggestion = async (suggestion: AddressSuggestion) => {
    let latitude = suggestion.latitude;
    let longitude = suggestion.longitude;
    let label = suggestion.label;
    if (suggestion.placeId && farmPlaces) {
      const place = await farmPlaces.fetchPlace(suggestion.placeId);
      latitude = place.latitude;
      longitude = place.longitude;
      label = place.address || suggestion.label;
    }
    if (latitude === undefined || longitude === undefined) throw new Error('Koordinat lokasi tidak tersedia.');
    searchCache.current.set(searchText.trim().toLocaleLowerCase('id-ID'), { latitude, longitude });
    selectedLocationLabel.current = label;
    setSearchText(label);
    setSuggestions([]);
    setSuggestionsQuery('');
    Keyboard.dismiss();
    setCenterTarget({ latitude, longitude });
  };

  const selectSuggestion = async (suggestion: AddressSuggestion) => {
    setSearchBusy(true);
    try {
      await applySuggestion(suggestion);
    } catch (error) {
      console.warn('Alamat Google Places tidak dapat dipilih.', error);
      Alert.alert('Lokasi belum dapat dipilih', formatPlacesError(error));
      if (Platform.OS === 'android') void farmPlaces?.resetSession();
    } finally {
      setSearchBusy(false);
    }
  };

  const zoomMap = (amount: number) => {
    const nextZoom = Math.max(3, Math.min(21, zoomLevel.current + amount));
    zoomLevel.current = nextZoom;
    if (hasGoogleMapsKey) {
      mapViewRef.current?.animateCamera({ zoom: nextZoom, pitch: 0, heading: 0 }, { duration: 220 });
    } else {
      webViewRef.current?.injectJavaScript(`window.zoomFarmMap && window.zoomFarmMap(${amount}); true;`);
    }
  };

  const centerOnCurrentLocation = async () => {
    if (locationBusy) return;
    setLocationBusy(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin lokasi diperlukan', 'Izinkan lokasi saat aplikasi digunakan atau cari nama tempat.');
        return;
      }
      const lastKnown = await Location.getLastKnownPositionAsync();
      const position = lastKnown ?? await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCenterTarget({ latitude: position.coords.latitude, longitude: position.coords.longitude });
    } catch (error) {
      console.warn('Lokasi perangkat tidak tersedia.', error);
      Alert.alert('Lokasi tidak tersedia', 'Aktifkan lokasi perangkat atau cari nama tempat.');
    } finally {
      setLocationBusy(false);
    }
  };

  const close = () => {
    if (Platform.OS === 'android') void farmPlaces?.resetSession();
    clearPoints();
    setMapReady(false);
    setSearchText('');
    setSuggestions([]);
    setSuggestionsQuery('');
    setSuggestionsBusy(false);
    setSearchBusy(false);
    selectedLocationLabel.current = null;
    zoomLevel.current = 16;
    onClose();
  };

  return <Modal visible={visible} animationType="slide" onRequestClose={close}>
    <SafeAreaProvider>
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <BackButton onPress={close} />
        <View style={s.headerCopy}>
          <Text style={s.title}>Ukur luas kebun</Text>
          <Text style={s.subtitle}>{hasGoogleMapsKey ? 'Google Maps · citra satelit · ketuk batas kebun' : 'Peta satelit aktif setelah API key GCP dipasang'}</Text>
        </View>
      </View>
      <View style={s.locationPicker}>
        <View style={s.searchRow}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Cari desa, kecamatan, atau kota"
            placeholderTextColor={c.textSecondary}
            returnKeyType="search"
            onSubmitEditing={() => void searchLocation()}
            style={s.searchInput}
          />
          <Pressable accessibilityRole="button" onPress={() => void searchLocation()} disabled={searchBusy || searchText.trim().length < 3} style={[s.searchButton, (searchBusy || searchText.trim().length < 3) && s.disabled]}>
            {searchBusy ? <ActivityIndicator size="small" color={c.onPrimary} /> : <Text style={s.searchButtonText}>Cari</Text>}
          </Pressable>
        </View>
        {searchText.trim().length >= 3 && suggestionsQuery === searchText.trim() && suggestions.length > 0 ? <View style={s.suggestionsBox}>
          {suggestions.map((suggestion, index) => <Pressable
            key={suggestion.id}
            accessibilityRole="button"
            onPress={() => void selectSuggestion(suggestion)}
            style={[s.suggestionRow, index < suggestions.length - 1 && s.suggestionDivider]}
          >
            <Text style={s.suggestionPin}>⌖</Text>
            <View style={s.suggestionCopy}>
              <Text numberOfLines={1} style={s.suggestionTitle}>{suggestion.label}</Text>
              {suggestion.detail ? <Text numberOfLines={1} style={s.suggestionDetail}>{suggestion.detail}</Text> : null}
            </View>
          </Pressable>)}
          <Text style={s.suggestionAttribution}>{Platform.OS === 'android' ? 'Powered by Google' : 'Data lokasi © OpenStreetMap contributors · Photon'}</Text>
        </View> : searchText.trim().length >= 3 && suggestionsBusy && suggestionsQuery === searchText.trim() ? <View style={s.suggestionLoading}><ActivityIndicator size="small" color={c.primary} /><Text style={s.suggestionDetail}>Mencari alamat…</Text></View> : null}
        {suggestionsError ? <Text style={s.searchError}>{suggestionsError}</Text> : null}
        <Pressable accessibilityRole="button" onPress={() => void centerOnCurrentLocation()} disabled={locationBusy} style={s.currentLocationButton}>
          {locationBusy ? <ActivityIndicator size="small" color={c.primary} /> : <Text style={s.currentLocationText}>⌖  Gunakan lokasi saya</Text>}
        </Pressable>
      </View>
      <View style={s.mapWrap}>
        {hasGoogleMapsKey ? <MapView
          ref={mapViewRef}
          provider={PROVIDER_GOOGLE}
          style={s.webview}
          mapType="hybrid"
          pitchEnabled={false}
          rotateEnabled={false}
          showsBuildings={false}
          toolbarEnabled={false}
          initialRegion={{ ...center, latitudeDelta: 0.008, longitudeDelta: 0.008 }}
          onMapReady={() => setMapReady(true)}
          onRegionChangeComplete={(region) => {
            if (region.longitudeDelta > 0) zoomLevel.current = Math.log2(360 / region.longitudeDelta);
          }}
          onPress={addMapPoint}
        >
          {points.length >= 3 ? <Polygon coordinates={points.map(([latitude, longitude]) => ({ latitude, longitude }))} strokeColor="#007A53" strokeWidth={3} fillColor="rgba(40,185,149,0.3)" /> : null}
          {points.map(([latitude, longitude], index) => <Marker
            key={`${latitude}-${longitude}-${index}`}
            coordinate={{ latitude, longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={s.boundaryDot} />
          </Marker>)}
        </MapView> : <CompatibleWebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={onMessage}
          onLoadEnd={() => {
            setMapReady(true);
            if (centerTarget) {
              webViewRef.current?.injectJavaScript(`window.centerFarmMap && window.centerFarmMap(${centerTarget.latitude},${centerTarget.longitude},16); true;`);
            }
          }}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
          applicationNameForUserAgent="AvasthaniFarmMap/1.0"
          style={s.webview}
          renderLoading={() => <View style={s.loading}><ActivityIndicator color={c.primary} /><Text style={s.loadingText}>Memuat peta…</Text></View>}
          startInLoadingState
        />}
        <View pointerEvents="none" style={s.mapHint}><Text style={s.mapHintText}>Geser peta, lalu ketuk tiap sudut lahan</Text></View>
        <View style={s.zoomControls}>
          <Pressable accessibilityRole="button" accessibilityLabel="Perbesar peta" onPress={() => zoomMap(1)} style={s.zoomButton}><Text style={s.zoomGlyph}>+</Text></Pressable>
          <View style={s.zoomDivider} />
          <Pressable accessibilityRole="button" accessibilityLabel="Perkecil peta" onPress={() => zoomMap(-1)} style={s.zoomButton}><Text style={s.zoomGlyph}>−</Text></Pressable>
        </View>
      </View>
      <View style={s.footer}>
        <View style={s.measureRow}>
          <View><Text style={s.measureLabel}>TITIK BATAS</Text><Text style={s.measureValue}>{points.length} titik</Text></View>
          <View style={s.areaValueWrap}><Text style={s.measureLabel}>PERKIRAAN LUAS</Text><Text style={s.measureValue}>{areaHectares > 0 ? `${formatArea(areaHectares)} ha` : '— ha'}</Text></View>
          <Pressable accessibilityRole="button" onPress={clearPoints} disabled={!points.length} style={[s.undoButton, !points.length && s.disabled]}>
            <Text style={s.undoText}>Hapus</Text>
          </Pressable>
        </View>
        <Pressable accessibilityRole="button" accessibilityState={{ disabled: points.length < 3 }} onPress={confirm} disabled={points.length < 3} style={[s.confirmButton, points.length < 3 && s.disabled]}>
          <Text style={s.confirmText}>Gunakan hasil pengukuran</Text>
        </Pressable>
        <Text style={s.note}>Luas perkiraan dihitung dari titik yang Anda tandai. Periksa kembali batas lahan di lokasi.</Text>
      </View>
    </SafeAreaView>
    </SafeAreaProvider>
  </Modal>;
}

function formatArea(area: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 3 }).format(area);
}

function currentTime() {
  return Date.now();
}

async function fetchGooglePlaceSuggestions(query: string): Promise<AddressSuggestion[]> {
  if (!farmPlaces) throw new Error('Pencarian Google Places belum tersedia. Tutup aplikasi lalu buat ulang development build Android.');
  const predictions = await farmPlaces.autocomplete(query);
  return predictions.map((prediction) => ({
    id: prediction.placeId,
    placeId: prediction.placeId,
    label: prediction.primaryText || prediction.fullText,
    detail: prediction.secondaryText,
  }));
}

function formatPlacesError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/API_NOT_CONNECTED|REQUEST_DENIED|Places API.*not enabled|PERMISSION_DENIED/i.test(message)) {
    return 'Google Places belum diizinkan untuk API key ini. Aktifkan Places API (New) dan tambahkan ke API restrictions pada key Android yang sama.';
  }
  return `${message || 'Layanan pencarian tidak merespons.'} Coba lagi sebentar.`;
}

async function fetchAddressSuggestions(query: string, limit: number, signal?: AbortSignal): Promise<AddressSuggestion[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit), lang: 'id' });
  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    headers: { Accept: 'application/json', 'User-Agent': `AvasthaniMobile/1.0 (contact: ${APP_CONTACT})` },
    signal,
  });
  if (!response.ok) throw new Error(`Photon returned ${response.status}`);
  const data = await response.json() as { features?: PhotonFeature[] };
  return (data.features ?? []).flatMap((feature, index) => {
    const coordinates = feature.geometry?.coordinates;
    if (!coordinates || coordinates.length < 2) return [];
    const props = feature.properties ?? {};
    const label = props.name || props.street || props.city || props.county || props.state;
    if (!label) return [];
    const detail = [...new Set([
      props.street,
      props.district,
      props.locality,
      props.city,
      props.county,
      props.state,
      props.postcode,
      props.country,
    ].filter((part): part is string => Boolean(part) && part !== label))].join(', ');
    return [{
      id: `${props.osm_id ?? 'location'}-${index}-${coordinates[0]}-${coordinates[1]}`,
      label,
      detail,
      longitude: coordinates[0],
      latitude: coordinates[1],
    }];
  });
}

async function fetchSingleAddress(query: string): Promise<AddressSuggestion | undefined> {
  // Nominatim is used only for an explicit single search. Its public service
  // does not permit client-side autocomplete.
  const params = new URLSearchParams({ format: 'jsonv2', q: query, limit: '1' });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'id,en',
      'User-Agent': `AvasthaniMobile/1.0 (contact: ${APP_CONTACT})`,
    },
  });
  if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);
  const results = await response.json() as { lat: string; lon: string; display_name: string; place_id: number }[];
  const result = results[0];
  if (!result) return undefined;
  const [label, ...addressParts] = result.display_name.split(',').map((part) => part.trim());
  return {
    id: `nominatim-${result.place_id}`,
    label: label || result.display_name,
    detail: addressParts.join(', '),
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  };
}

function calculatePolygonArea(ring: [number, number][]) {
  if (ring.length < 3) return 0;
  const earthRadius = 6_371_008.8;
  const referenceLatitude = ring.reduce((total, point) => total + point[0], 0) / ring.length * Math.PI / 180;
  const projected = ring.map(([latitude, longitude]) => [
    earthRadius * longitude * Math.PI / 180 * Math.cos(referenceLatitude),
    earthRadius * latitude * Math.PI / 180,
  ]);
  let area = 0;
  for (let index = 0, previous = projected.length - 1; index < projected.length; previous = index, index += 1) {
    area += projected[previous][0] * projected[index][1] - projected[index][0] * projected[previous][1];
  }
  return Math.abs(area / 2);
}

function createMapHtml(latitude: number, longitude: number) {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"><style>*{box-sizing:border-box}html,body,#map{height:100%;width:100%;margin:0;background:#e9f0eb;font-family:-apple-system,BlinkMacSystemFont,Arial,sans-serif}.leaflet-control-attribution{font-size:10px!important}.leaflet-container{background:#e9f0eb}</style></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
    const map=L.map('map',{zoomControl:false}).setView([${latitude},${longitude}],16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    const points=[];const markers=[];let polygon=null;
    function areaOf(ring){if(ring.length<3)return 0;const R=6371008.8,lat0=ring.reduce((s,p)=>s+p[0],0)/ring.length*Math.PI/180;const xy=ring.map(p=>[R*p[1]*Math.PI/180*Math.cos(lat0),R*p[0]*Math.PI/180]);let area=0;for(let i=0,j=xy.length-1;i<xy.length;j=i++)area+=xy[j][0]*xy[i][1]-xy[i][0]*xy[j][1];return Math.abs(area/2)}
    function update(){if(polygon)map.removeLayer(polygon);polygon=points.length>=2?L.polygon(points,{color:'#007A53',weight:3,fillColor:'#28B995',fillOpacity:.25}).addTo(map):null;const area=areaOf(points);window.ReactNativeWebView.postMessage(JSON.stringify({points,area}));}
    window.clearFarmPoints=function(){points.length=0;markers.forEach(marker=>map.removeLayer(marker));markers.length=0;update()};
    window.centerFarmMap=function(lat,lon,zoom){map.setView([lat,lon],zoom||16)};
    window.zoomFarmMap=function(delta){map.setZoom(Math.max(3,Math.min(19,map.getZoom()+delta)))};
    map.on('click',e=>{points.push([e.latlng.lat,e.latlng.lng]);markers.push(L.circleMarker(e.latlng,{radius:6,color:'#fff',weight:2,fillColor:'#007A53',fillOpacity:1}).addTo(map));update()});
  </script></body></html>`;
}

const styles = (c: Palette) => StyleSheet.create({
  root: { flex: 1, backgroundColor: c.background },
  header: { minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 11 },
  headerCopy: { flex: 1 }, title: { color: c.textPrimary, fontSize: 18, fontWeight: '800' }, subtitle: { color: c.textSecondary, fontSize: 11, marginTop: 2 },
  locationPicker: { paddingHorizontal: 16, paddingBottom: 8, backgroundColor: c.background },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1, minHeight: 44, paddingHorizontal: 13, color: c.textPrimary, fontSize: 12, backgroundColor: c.surface, borderRadius: 13, borderWidth: 1, borderColor: c.border },
  searchButton: { width: 62, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: c.primary }, searchButtonText: { color: c.onPrimary, fontSize: 12, fontWeight: '800' },
  suggestionsBox: { marginTop: 6, overflow: 'hidden', borderRadius: 14, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, elevation: 5 },
  suggestionRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 10 },
  suggestionDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
  suggestionPin: { width: 20, color: c.primary, fontSize: 19, textAlign: 'center' },
  suggestionCopy: { flex: 1 },
  suggestionTitle: { color: c.textPrimary, fontSize: 12, fontWeight: '700' },
  suggestionDetail: { color: c.textSecondary, fontSize: 10, marginTop: 2 },
  suggestionAttribution: { color: c.textSecondary, fontSize: 8, textAlign: 'right', paddingHorizontal: 10, paddingVertical: 5, backgroundColor: c.background },
  searchError: { color: c.danger, fontSize: 10, marginTop: 5, paddingHorizontal: 5 },
  suggestionLoading: { minHeight: 42, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 9 },
  currentLocationButton: { minHeight: 32, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 8, marginTop: 2 }, currentLocationText: { color: c.primary, fontSize: 11, fontWeight: '800' },
  mapWrap: { flex: 1, overflow: 'hidden', backgroundColor: '#E9F0EB' }, webview: { flex: 1, backgroundColor: 'transparent' },
  mapHint: { position: 'absolute', top: 12, left: 14, right: 64, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.94)' }, mapHintText: { color: c.textPrimary, fontSize: 11, fontWeight: '700' },
  zoomControls: { position: 'absolute', top: 60, right: 14, overflow: 'hidden', borderRadius: 13, backgroundColor: c.surface, elevation: 5, shadowColor: '#1F2A24', shadowOpacity: 0.16, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  zoomButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  zoomGlyph: { color: c.textPrimary, fontSize: 26, lineHeight: 30, fontWeight: '500' },
  zoomDivider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border },
  boundaryDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#00CFA2', borderWidth: 2, borderColor: '#FFFFFF' },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#E9F0EB' }, loadingText: { color: c.textSecondary, fontSize: 12 },
  footer: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 16, backgroundColor: c.surface, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
  measureRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12 }, measureLabel: { color: c.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }, measureValue: { color: c.textPrimary, fontSize: 15, fontWeight: '800', marginTop: 3 }, areaValueWrap: { flex: 1, alignItems: 'center' },
  undoButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: c.pressed }, undoText: { color: c.primary, fontSize: 11, fontWeight: '800' },
  confirmButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: c.primary }, confirmText: { color: c.onPrimary, fontSize: 13, fontWeight: '800' }, disabled: { opacity: 0.45 },
  note: { color: c.textSecondary, fontSize: 9, textAlign: 'center', lineHeight: 13, marginTop: 8 },
});
