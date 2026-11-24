import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, ActivityIndicator, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '@/components/AppText';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '@/features/auth/AuthProvider';
import { createFarm, listFarms, removeFarm, updateFarm, type Farm } from '@/features/farms/service';
import { AreaMapPicker, type MeasuredArea } from '@/components/farms/AreaMapPicker';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';
import { Page } from '@/components/ui';

const commonCrops = ['Cabai', 'Tomat', 'Padi', 'Jagung', 'Bawang', 'Kedelai'];

export default function FarmTab() {
  const c = useColors();
  const styles = stylesFor(c);
  const { user } = useAuth();
  const uid = user?.uid;
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [formVisible, setFormVisible] = useState(false);
  const [editingFarm, setEditingFarm] = useState<Farm | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locationBusy, setLocationBusy] = useState(false);
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [area, setArea] = useState('');
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [boundary, setBoundary] = useState<[number, number][]>([]);
  const [customCrop, setCustomCrop] = useState('');
  const totalArea = useMemo(() => farms.reduce((total, farm) => total + farm.areaHectares, 0), [farms]);

  const load = useCallback(async () => {
    await Promise.resolve();
    if (!uid) {
      setFarms([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError('');
    try {
      setFarms(await listFarms(uid));
    } catch (error) {
      console.error('Daftar kebun gagal dimuat.', error);
      setLoadError('Daftar kebun belum dapat dimuat. Periksa koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const resetForm = () => {
    setName('');
    setLocationName('');
    setLatitude(undefined);
    setLongitude(undefined);
    setArea('');
    setSelectedCrops([]);
    setCustomCrop('');
    setBoundary([]);
  };

  const openForm = () => {
    setEditingFarm(null);
    resetForm();
    setFormVisible(true);
  };

  const openEditForm = (farm: Farm) => {
    setEditingFarm(farm);
    setName(farm.name);
    setLocationName(farm.location);
    setLatitude(farm.latitude);
    setLongitude(farm.longitude);
    setArea(String(farm.areaHectares).replace('.', ','));
    setSelectedCrops(farm.crops ?? []);
    setCustomCrop('');
    setBoundary(farm.boundary ?? []);
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setEditingFarm(null);
    resetForm();
  };

  const captureCurrentLocation = async () => {
    if (locationBusy) return;
    setLocationBusy(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin lokasi diperlukan', 'Izinkan akses lokasi saat menggunakan aplikasi atau masukkan nama lokasi secara manual.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [place] = await Location.reverseGeocodeAsync({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      const address = [place?.district, place?.city || place?.subregion, place?.region]
        .filter((part, index, all): part is string => Boolean(part) && all.indexOf(part) === index)
        .join(', ');
      setLatitude(position.coords.latitude);
      setLongitude(position.coords.longitude);
      setBoundary([]);
      setLocationName(address || `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
    } catch (error) {
      console.error('Lokasi kebun gagal diperoleh.', error);
      Alert.alert('Lokasi belum tersedia', 'Pastikan layanan lokasi perangkat aktif, lalu coba lagi.');
    } finally {
      setLocationBusy(false);
    }
  };

  const toggleCrop = (crop: string) => {
    setSelectedCrops((current) => current.includes(crop) ? current.filter((item) => item !== crop) : [...current, crop]);
  };

  const addCustomCrop = () => {
    const crop = customCrop.trim();
    if (crop && !selectedCrops.some((item) => item.toLocaleLowerCase('id-ID') === crop.toLocaleLowerCase('id-ID'))) {
      setSelectedCrops((current) => [...current, crop]);
    }
    setCustomCrop('');
  };

  const save = async () => {
    const areaHectares = Number(area.trim().replace(',', '.'));
    if (name.trim().length < 2) {
      Alert.alert('Nama kebun belum lengkap', 'Masukkan nama kebun, minimal 2 karakter.');
      return;
    }
    if (locationName.trim().length < 2) {
      Alert.alert('Lokasi belum diisi', 'Gunakan lokasi saat ini atau masukkan nama lokasi kebun.');
      return;
    }
    if (!Number.isFinite(areaHectares) || areaHectares <= 0) {
      Alert.alert('Luas belum valid', 'Masukkan luas lahan dalam hektare. Contoh: 0,5.');
      return;
    }
    if (!selectedCrops.length) {
      Alert.alert('Tanaman belum dipilih', 'Pilih setidaknya satu tanaman yang dibudidayakan.');
      return;
    }
    if (!uid) return;

    setSaving(true);
    try {
      const draft = {
        name: name.trim(),
        location: locationName.trim(),
        ...(latitude !== undefined ? { latitude } : {}),
        ...(longitude !== undefined ? { longitude } : {}),
        areaHectares,
        crops: selectedCrops,
        ...(boundary.length >= 3 || editingFarm?.boundary?.length ? { boundary } : {}),
      };
      if (editingFarm) await updateFarm(uid, editingFarm.id, draft);
      else await createFarm(uid, draft);
      closeForm();
      await load();
    } catch (error) {
      console.error('Kebun gagal disimpan.', error);
      Alert.alert('Kebun belum tersimpan', getSaveErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const confirmRemove = (farm: Farm) => {
    Alert.alert('Hapus kebun?', `Data “${farm.name}” akan dihapus dari daftar kebun Anda.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          if (!uid) return;
          void removeFarm(uid, farm.id).then(load).catch((error: unknown) => {
            console.error('Kebun gagal dihapus.', error);
            Alert.alert('Tidak dapat menghapus kebun', 'Coba lagi beberapa saat.');
          });
        },
      },
    ]);
  };

  const applyMapMeasurement = async (measurement: MeasuredArea) => {
    setLatitude(measurement.latitude);
    setLongitude(measurement.longitude);
    setArea(measurement.areaHectares.toFixed(3).replace('.', ','));
    setBoundary(measurement.boundary);
    setMapVisible(false);
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude: measurement.latitude, longitude: measurement.longitude });
      const address = [place?.district, place?.city || place?.subregion, place?.region]
        .filter((part, index, all): part is string => Boolean(part) && all.indexOf(part) === index)
        .join(', ');
      setLocationName(address || `${measurement.latitude.toFixed(5)}, ${measurement.longitude.toFixed(5)}`);
    } catch (error) {
      console.warn('Nama lokasi hasil pengukuran tidak dapat diperoleh.', error);
      setLocationName(`${measurement.latitude.toFixed(5)}, ${measurement.longitude.toFixed(5)}`);
    }
  };

  return <>
    <Page bottomPadding={112}>
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>Kebun saya</Text>
          <Text style={styles.subtitle}>Simpan lokasi, luas lahan, dan tanaman yang Anda kelola.</Text>
        </View>
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{farms.length}</Text>
          <Text style={styles.summaryLabel}>Kebun</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{formatArea(totalArea)} ha</Text>
          <Text style={styles.summaryLabel}>Total luas</Text>
        </View>
      </View>

      <Pressable accessibilityRole="button" onPress={openForm} style={styles.addButton}>
        <Text style={styles.addGlyph}>＋</Text>
        <Text style={styles.addButtonText}>Tambah kebun</Text>
      </Pressable>

      <View style={styles.listHeading}>
        <Text style={styles.listTitle}>Daftar kebun</Text>
        {farms.length ? <Text style={styles.count}>{farms.length} lokasi</Text> : null}
      </View>

      {loading ? <View style={styles.loading}><ActivityIndicator color={c.primary} /><Text style={styles.emptyDescription}>Memuat daftar kebun…</Text></View>
        : loadError ? <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Belum dapat memuat data</Text>
          <Text style={styles.emptyDescription}>{loadError}</Text>
          <Pressable accessibilityRole="button" onPress={() => void load()}><Text style={styles.retry}>Coba lagi</Text></Pressable>
        </View>
        : farms.length ? <View style={styles.farmList}>
          {farms.map((farm) => <FarmCard key={farm.id} farm={farm} onEdit={() => openEditForm(farm)} onDelete={() => confirmRemove(farm)} />)}
        </View>
        : <View style={styles.emptyCard}>
          <View style={styles.emptyPlant}><Text style={styles.emptyPlantGlyph}>🌱</Text></View>
          <Text style={styles.emptyTitle}>Belum ada kebun</Text>
          <Text style={styles.emptyDescription}>Tambahkan lahan pertama Anda untuk mencatat luas, lokasi, dan tanaman.</Text>
          <Pressable accessibilityRole="button" onPress={openForm} style={styles.emptyAction}><Text style={styles.emptyActionText}>Tambah kebun pertama</Text></Pressable>
        </View>}
    </Page>

    <Modal transparent animationType="slide" visible={formVisible} onRequestClose={closeForm}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityRole="button" accessibilityLabel="Tutup formulir" style={styles.backdrop} onPress={closeForm} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.sheetHeader}>
            <View><Text style={styles.sheetTitle}>{editingFarm ? 'Edit kebun' : 'Tambah kebun'}</Text><Text style={styles.sheetSubtitle}>Isi informasi dasar lahan Anda.</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Tutup" onPress={closeForm} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable>
          </View>
          <Text style={styles.inputLabel}>Nama kebun</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Contoh: Kebun Melati" placeholderTextColor="#829188" style={styles.input} maxLength={80} />

          <View style={styles.labelRow}>
            <Text style={styles.inputLabel}>Lokasi</Text>
            <Pressable accessibilityRole="button" onPress={() => void captureCurrentLocation()} disabled={locationBusy} style={styles.locationAction}>
              {locationBusy ? <ActivityIndicator size="small" color={c.primary} /> : <Text style={styles.locationActionText}>⌖ Gunakan lokasi</Text>}
            </Pressable>
          </View>
          <TextInput
            value={locationName}
            onChangeText={(value) => { setLocationName(value); setLatitude(undefined); setLongitude(undefined); setBoundary([]); }}
            placeholder="Nama desa, kecamatan, atau alamat"
            placeholderTextColor="#829188"
            style={styles.input}
            maxLength={180}
          />
          {latitude !== undefined && longitude !== undefined ? <Text style={styles.coordinates}>Koordinat tersimpan · {latitude.toFixed(5)}, {longitude.toFixed(5)}</Text> : null}

          <Text style={styles.inputLabel}>Luas lahan</Text>
          <View style={styles.areaRow}>
            <TextInput value={area} onChangeText={setArea} placeholder="Contoh: 0,5" placeholderTextColor="#829188" keyboardType="decimal-pad" style={[styles.input, styles.areaInput]} />
            <View style={styles.unitPill}><Text style={styles.unitText}>hektare</Text></View>
          </View>
          <Pressable accessibilityRole="button" onPress={() => setMapVisible(true)} style={styles.earthLink}>
            <Text style={styles.earthGlyph}>⌖</Text>
            <View style={styles.earthCopy}><Text style={styles.earthTitle}>Ukur langsung di peta</Text><Text style={styles.earthDescription}>Tandai sudut kebun di Maps untuk menghitung luas.</Text></View>
            <Text style={styles.earthArrow}>›</Text>
          </Pressable>

          <Text style={styles.inputLabel}>Tanaman di kebun</Text>
          <View style={styles.cropOptions}>
            {commonCrops.map((crop) => <CropChip key={crop} label={crop} selected={selectedCrops.includes(crop)} onPress={() => toggleCrop(crop)} />)}
            {selectedCrops.filter((crop) => !commonCrops.includes(crop)).map((crop) => <CropChip key={crop} label={crop} selected onPress={() => toggleCrop(crop)} />)}
          </View>
          <View style={styles.customCropRow}>
            <TextInput value={customCrop} onChangeText={setCustomCrop} placeholder="Tanaman lainnya" placeholderTextColor="#829188" style={[styles.input, styles.customCropInput]} returnKeyType="done" onSubmitEditing={addCustomCrop} maxLength={40} />
            <Pressable accessibilityRole="button" onPress={addCustomCrop} style={styles.customCropButton}><Text style={styles.customCropButtonText}>Tambah</Text></Pressable>
          </View>
          <Pressable accessibilityRole="button" onPress={() => void save()} disabled={saving} style={[styles.saveButton, saving && styles.disabled]}>
            {saving ? <ActivityIndicator color={c.onPrimary} /> : <Text style={styles.saveButtonText}>{editingFarm ? 'Simpan perubahan' : 'Simpan kebun'}</Text>}
          </Pressable>
          <Text style={styles.formNote}>Pengukuran peta bersifat perkiraan. Periksa hasilnya sebelum menyimpan.</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
    <AreaMapPicker
      key={mapVisible ? 'open' : 'closed'}
      visible={mapVisible}
      initialCenter={latitude !== undefined && longitude !== undefined ? { latitude, longitude } : undefined}
      initialBoundary={boundary}
      onClose={() => setMapVisible(false)}
      onConfirm={(measurement) => void applyMapMeasurement(measurement)}
    />
  </>;
}

function FarmCard({ farm, onEdit, onDelete }: { farm: Farm; onEdit: () => void; onDelete: () => void }) {
  const c = useColors();
  const styles = stylesFor(c);
  return <View style={styles.farmCard}>
    <View style={styles.farmCardTop}>
      <View style={styles.farmIcon}><Text style={styles.farmIconGlyph}>🌿</Text></View>
      <View style={styles.farmInfo}>
        <Text numberOfLines={1} style={styles.farmName}>{farm.name}</Text>
        <Text numberOfLines={2} style={styles.farmLocation}>⌖  {farm.location}</Text>
      </View>
      <View style={styles.cardActions}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${farm.name}`} onPress={onEdit} hitSlop={8} style={styles.editButton}><Text style={styles.editGlyph}>✎</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Hapus ${farm.name}`} onPress={onDelete} hitSlop={8} style={styles.deleteButton}><Text style={styles.deleteGlyph}>×</Text></Pressable>
      </View>
    </View>
    <View style={styles.farmCardDivider} />
    <View style={styles.farmMeta}>
      <View><Text style={styles.metaLabel}>LUAS</Text><Text style={styles.metaValue}>{formatArea(farm.areaHectares)} ha</Text></View>
      <View style={styles.cropWrap}>{farm.crops.map((crop) => <View key={crop} style={styles.cropTag}><Text numberOfLines={1} style={styles.cropTagText}>{crop}</Text></View>)}</View>
    </View>
    {farm.boundary && farm.boundary.length >= 3 ? <View style={styles.mapPreviewWrap}>
      <Text style={styles.mapPreviewLabel}>BATAS LAHAN</Text>
      <MapView
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.mapPreview}
        mapType="hybrid"
        initialRegion={getBoundaryRegion(farm.boundary)}
        pitchEnabled={false}
        rotateEnabled={false}
        scrollEnabled={false}
        zoomEnabled={false}
        toolbarEnabled={false}
        pointerEvents="none"
      >
        <Polygon coordinates={farm.boundary.map(([latitude, longitude]) => ({ latitude, longitude }))} strokeColor="#007A53" strokeWidth={3} fillColor="rgba(0,207,162,0.35)" />
        {farm.boundary.map(([latitude, longitude], index) => <Marker key={`${index}-${latitude}-${longitude}`} coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}><View style={styles.previewDot} /></Marker>)}
      </MapView>
    </View> : <View style={styles.mapPreviewEmpty}>
      <Text style={styles.mapPreviewEmptyText}>Batas poligon belum tersimpan. Edit kebun untuk mengukur dan menyimpan bentuk lahannya.</Text>
      <Pressable accessibilityRole="button" onPress={onEdit}><Text style={styles.mapPreviewAction}>Ukur di peta ›</Text></Pressable>
    </View>}
  </View>;
}

function getBoundaryRegion(boundary: [number, number][]) {
  const latitudes = boundary.map(([latitude]) => latitude);
  const longitudes = boundary.map(([, longitude]) => longitude);
  const latitude = (Math.min(...latitudes) + Math.max(...latitudes)) / 2;
  const longitude = (Math.min(...longitudes) + Math.max(...longitudes)) / 2;
  return {
    latitude,
    longitude,
    // Keep a small safety margin around the polygon so it fills the compact preview.
    latitudeDelta: Math.max((Math.max(...latitudes) - Math.min(...latitudes)) * 1.2, 0.00055),
    longitudeDelta: Math.max((Math.max(...longitudes) - Math.min(...longitudes)) * 1.2, 0.00055),
  };
}

function CropChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const c = useColors();
  const styles = stylesFor(c);
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={onPress} style={[styles.cropChip, selected && styles.cropChipSelected]}>
    <Text style={[styles.cropChipText, selected && styles.cropChipTextSelected]}>{selected ? '✓ ' : ''}{label}</Text>
  </Pressable>;
}

function formatArea(area: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(area);
}

function getSaveErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code).toLowerCase()
    : '';
  if (code.includes('permission-denied')) {
    return 'Firebase menolak perubahan kebun. Jika Anda menyimpan batas poligon, aturan Firestore terbaru harus di-deploy terlebih dahulu. Pastikan juga Anda masuk dengan akun pemilik kebun.';
  }
  if (code.includes('unauthenticated')) return 'Sesi login Anda sudah berakhir. Masuk kembali, lalu coba simpan.';
  if (code.includes('unavailable') || code.includes('network')) return 'Layanan Firestore tidak dapat dijangkau. Periksa koneksi lalu coba lagi.';
  const message = error instanceof Error ? error.message : '';
  return message ? `Terjadi kesalahan saat menyimpan (${message}).` : 'Terjadi kesalahan saat menyimpan. Coba lagi.';
}

const stylesFor = (c: Palette) => StyleSheet.create({
  heading: { marginBottom: 20 },
  eyebrow: { color: c.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.4, marginBottom: 5 },
  title: { color: c.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: c.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 5 },
  summary: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.primarySoft, paddingVertical: 16, paddingHorizontal: 18, borderRadius: 20, marginBottom: 14 },
  summaryItem: { flex: 1, alignItems: 'center' }, summaryValue: { color: c.primaryDark, fontSize: 20, fontWeight: '800' }, summaryLabel: { color: c.textSecondary, fontSize: 11, marginTop: 3 },
  summaryDivider: { width: 1, height: 38, backgroundColor: '#C8DDD0' },
  addButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: c.primary, borderRadius: 17, marginBottom: 24 },
  addGlyph: { color: c.onPrimary, fontSize: 23, lineHeight: 25, fontWeight: '400' }, addButtonText: { color: c.onPrimary, fontSize: 15, fontWeight: '800' },
  listHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  listTitle: { color: c.textPrimary, fontSize: 18, fontWeight: '800' }, count: { color: c.textSecondary, fontSize: 11 },
  farmList: { gap: 12 }, farmCard: { padding: 15, backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.border },
  farmCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, farmIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: c.primarySoft }, farmIconGlyph: { fontSize: 24 },
  farmInfo: { flex: 1, minWidth: 0 }, farmName: { color: c.textPrimary, fontSize: 15, fontWeight: '800' }, farmLocation: { color: c.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 4 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 6 }, editButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: c.primarySoft }, editGlyph: { color: c.primary, fontSize: 18, lineHeight: 22 },
  deleteButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#F4F6F4' }, deleteGlyph: { color: c.textSecondary, fontSize: 22, lineHeight: 24 },
  farmCardDivider: { height: 1, backgroundColor: '#EDF1EE', marginVertical: 13 }, farmMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  metaLabel: { color: c.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }, metaValue: { color: c.textPrimary, fontSize: 15, fontWeight: '800', marginTop: 3 },
  cropWrap: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 5 }, cropTag: { maxWidth: 92, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 11, backgroundColor: '#F1F6F2' }, cropTagText: { color: c.primaryDark, fontSize: 10, fontWeight: '700' },
  mapPreviewWrap: { marginTop: 14 }, mapPreviewLabel: { color: c.textSecondary, fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginBottom: 6 }, mapPreview: { width: '100%', height: 116, borderRadius: 14, overflow: 'hidden' }, previewDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00CFA2', borderWidth: 1.5, borderColor: '#FFFFFF' },
  mapPreviewEmpty: { marginTop: 13, padding: 11, borderRadius: 14, backgroundColor: '#F5F8F5' }, mapPreviewEmptyText: { color: c.textSecondary, fontSize: 10, lineHeight: 15 }, mapPreviewAction: { color: c.primary, fontSize: 10, fontWeight: '800', marginTop: 7 },
  emptyCard: { alignItems: 'center', padding: 23, backgroundColor: c.surface, borderRadius: 22, borderWidth: 1, borderColor: c.border },
  emptyPlant: { width: 62, height: 62, alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: c.primarySoft, marginBottom: 13 }, emptyPlantGlyph: { fontSize: 31 },
  emptyTitle: { color: c.textPrimary, fontSize: 16, fontWeight: '800', textAlign: 'center' }, emptyDescription: { color: c.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  emptyAction: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 16, marginTop: 16, borderRadius: 14, backgroundColor: c.primarySoft }, emptyActionText: { color: c.primary, fontSize: 12, fontWeight: '800' },
  retry: { color: c.primary, fontSize: 13, fontWeight: '800', marginTop: 14 }, loading: { alignItems: 'center', paddingVertical: 32 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15, 31, 23, 0.38)' },
  sheet: { maxHeight: '92%', paddingHorizontal: 22, paddingTop: 10, paddingBottom: 24, backgroundColor: '#F8FAF8', borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sheetScroll: { flexShrink: 1 }, sheetContent: { paddingBottom: 2 },
  handle: { width: 42, height: 5, alignSelf: 'center', borderRadius: 3, backgroundColor: '#C8D4CD', marginBottom: 13 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sheetTitle: { color: c.textPrimary, fontSize: 20, fontWeight: '800' }, sheetSubtitle: { color: c.textSecondary, fontSize: 12, marginTop: 3 },
  closeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: '#E8F0EB' }, closeText: { color: c.textSecondary, fontSize: 23, lineHeight: 26 },
  inputLabel: { color: c.textPrimary, fontSize: 12, fontWeight: '800', marginBottom: 6 },
  input: { minHeight: 46, paddingHorizontal: 13, paddingVertical: 10, color: c.textPrimary, fontSize: 13, backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.border, marginBottom: 13 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 1 }, locationAction: { minHeight: 28, justifyContent: 'center', marginBottom: 5, paddingHorizontal: 8 }, locationActionText: { color: c.primary, fontSize: 10, fontWeight: '800' },
  coordinates: { color: c.textSecondary, fontSize: 10, marginTop: -8, marginBottom: 10 },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, areaInput: { flex: 1 }, unitPill: { height: 46, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 13, borderRadius: 14, backgroundColor: c.primarySoft, marginBottom: 13 }, unitText: { color: c.primaryDark, fontSize: 11, fontWeight: '800' },
  earthLink: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 11, borderRadius: 15, backgroundColor: '#FFF4DB', marginBottom: 15, marginTop: -2 },
  earthGlyph: { color: '#A76C12', fontSize: 20, fontWeight: '700' }, earthCopy: { flex: 1 }, earthTitle: { color: '#6D4C1C', fontSize: 11, fontWeight: '800' }, earthDescription: { color: '#856A3D', fontSize: 9, lineHeight: 13, marginTop: 2 }, earthArrow: { color: '#A76C12', fontSize: 20 },
  cropOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 9 },
  cropChip: { minHeight: 33, justifyContent: 'center', paddingHorizontal: 11, borderRadius: 17, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface },
  cropChipSelected: { borderColor: c.primary, backgroundColor: c.primarySoft }, cropChipText: { color: c.textSecondary, fontSize: 10, fontWeight: '700' }, cropChipTextSelected: { color: c.primary, fontWeight: '800' },
  customCropRow: { flexDirection: 'row', gap: 8, alignItems: 'center' }, customCropInput: { flex: 1 }, customCropButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 13, backgroundColor: c.primarySoft, marginBottom: 13 }, customCropButtonText: { color: c.primary, fontSize: 10, fontWeight: '800' },
  saveButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: c.primary, borderRadius: 15, marginTop: 1 }, saveButtonText: { color: c.onPrimary, fontSize: 14, fontWeight: '800' }, disabled: { opacity: 0.65 },
  formNote: { color: c.textSecondary, fontSize: 9, textAlign: 'center', marginTop: 9 },
});
