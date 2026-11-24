import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '@/components/AppText';
import { BackButton } from '@/components/BackButton';
import { router } from 'expo-router';
import { Page } from '@/components/ui';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';
import { useAuth } from '@/features/auth/AuthProvider';
import { listFarms, type Farm } from '@/features/farms/service';
import { getAIFertilizerRecommendation, type GrowingSeason, type PlantPhase } from '@/services/ai-recommendation';

type FertilizerRate = { name: string; kgPerHa: number };
type CropGuide = { name: string; rates: FertilizerRate[]; source: string; caveat: string };

// Working-dose references are deliberately visible in the UI. Rates are references,
// not universal prescriptions; actual recommendations depend on soil and cultivation.
const CROP_GUIDES: CropGuide[] = [
  { name: 'Cabai', rates: [{ name: 'NPK 15-10-12', kgPerHa: 400 }, { name: 'ZA', kgPerHa: 150 }, { name: 'Urea', kgPerHa: 150 }, { name: 'SP-36', kgPerHa: 165 }, { name: 'KCl', kgPerHa: 185 }], source: 'Rekomendasi Pupuk N, P, dan K Hortikultura (Kementan), cabai merah pada tanah non-Andisol, status hara sedang.', caveat: 'Gunakan sebagai acuan awal; varietas, jenis tanah, dan hasil uji tanah dapat mengubah dosis.' },
  { name: 'Tomat', rates: [{ name: 'NPK 15-15-15', kgPerHa: 1000 }], source: 'Penelitian Kementan pada tomat di tanah Latosol, dosis perlakuan NPK 15-15-15.', caveat: 'Acuan penelitian khusus tanah Latosol; dosis ini tidak otomatis cocok untuk semua kebun tomat.' },
  { name: 'Padi', rates: [{ name: 'Urea', kgPerHa: 250 }, { name: 'NPK', kgPerHa: 300 }], source: 'Contoh paket budidaya padi BRMP Tanaman Pangan; kebutuhan urea juga perlu dipantau dengan BWD.', caveat: 'Jenis NPK, status hara sawah, dan pembacaan BWD memengaruhi dosis aktual.' },
  { name: 'Jagung', rates: [{ name: 'Urea', kgPerHa: 450 }, { name: 'SP-36', kgPerHa: 125 }, { name: 'KCl', kgPerHa: 75 }], source: 'Info Teknologi Budidaya Jagung, Pustaka BPPSDMP Kementan; nilai tengah rentang SP-36 dan KCl.', caveat: 'Panduan asal membagi pemupukan menjadi dua tahap. Pembagian 10-harian di bawah hanya simulasi rata, bukan jadwal tahap resmi.' },
  { name: 'Bawang', rates: [{ name: 'Urea', kgPerHa: 150 }, { name: 'ZA', kgPerHa: 200 }, { name: 'SP-36', kgPerHa: 150 }, { name: 'KCl', kgPerHa: 150 }], source: 'Teknik Budidaya Tanaman Bawang Merah, Direktorat Budidaya Tanaman Sayuran dan Biofarmaka, Kementan.', caveat: 'Panduan asal membagi pupuk menjadi dua aplikasi; simulasi 10-harian bukan pengganti jadwal budidaya setempat.' },
  { name: 'Kedelai', rates: [{ name: 'Urea', kgPerHa: 25 }, { name: 'SP-36', kgPerHa: 200 }, { name: 'KCl', kgPerHa: 130 }], source: 'Rekomendasi pengelolaan lahan kedelai Kementan dengan pupuk kandang 2 ton/ha.', caveat: 'Angka bergantung pada bahan organik dan kondisi lahan; dosis contoh ini mengasumsikan pupuk kandang 2 ton/ha.' },
];

const periods = [30, 60, 90, 120];
const numberFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 });

const PHASES: { value: PlantPhase; label: string }[] = [
  { value: 'vegetatif', label: 'Vegetatif' },
  { value: 'generatif', label: 'Generatif' },
];

const SEASONS: { value: GrowingSeason; label: string }[] = [
  { value: 'hujan', label: 'Musim hujan' },
  { value: 'kemarau', label: 'Musim kemarau' },
];

const phaseLabel = (value: PlantPhase) =>
  value === 'generatif' ? 'generatif (pembuahan)' : 'vegetatif (pertumbuhan)';

/**
 * Tebakan musim dari bulan berjalan. Musim hujan di Indonesia kira-kira
 * Oktober–Maret, kemarau April–September. Hanya nilai awal — pengguna
 * selalu bisa menggantinya, karena pola musim tiap daerah berbeda.
 */
function guessSeason(date = new Date()): GrowingSeason {
  const month = date.getMonth() + 1;
  return month >= 4 && month <= 9 ? 'kemarau' : 'hujan';
}

function findCropGuide(cropName: string): CropGuide | undefined {
  const normalized = cropName.trim().toLocaleLowerCase('id-ID');
  return CROP_GUIDES.find((guide) => {
    const guideName = guide.name.toLocaleLowerCase('id-ID');
    return normalized === guideName || normalized.startsWith(`${guideName} `) || (guideName === 'bawang' && normalized.startsWith('bawang merah'));
  });
}

export default function FertilizerCalculatorScreen() {
  const c = useColors();
  const s = styles(c);
  const { user } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmsLoading, setFarmsLoading] = useState(true);
  const [farmsError, setFarmsError] = useState('');
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [farmPickerVisible, setFarmPickerVisible] = useState(false);
  const [plantText, setPlantText] = useState('');
  const [selectedFarmCrop, setSelectedFarmCrop] = useState('');
  const [periodDays, setPeriodDays] = useState(60);
  const [phase, setPhase] = useState<PlantPhase>('vegetatif');
  const [season, setSeason] = useState<GrowingSeason>(guessSeason);
  const [showMethod, setShowMethod] = useState(false);
  const [expandedScheduleDays, setExpandedScheduleDays] = useState<Set<number>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiCropGuide, setAiCropGuide] = useState<CropGuide | null>(null);
  // Fase dan musim yang benar-benar dipakai saat AI terakhir diminta, supaya
  // label hasil tidak ikut berubah kalau pengguna mengutak-atik pilihan.
  const [aiContext, setAiContext] = useState<{ phase: PlantPhase; season: GrowingSeason } | null>(null);
  const areaHa = selectedFarm?.areaHectares ?? 0;
  const plantCount = Number(plantText.trim());
  const cropOptions = useMemo(() => (selectedFarm?.crops ?? []).map((farmCrop) => ({ farmCrop, guide: findCropGuide(farmCrop) })), [selectedFarm]);
  const selectedCropOption = cropOptions.find((item) => item.farmCrop === selectedFarmCrop);
  const staticCrop = selectedCropOption?.guide ?? null;
  const crop = aiCropGuide ?? staticCrop;
  const validArea = Number.isFinite(areaHa) && areaHa > 0 && areaHa <= 10000;
  const validPlants = Number.isInteger(plantCount) && plantCount > 0;
  const intervalCount = periodDays / 10;

  useEffect(() => {
    let active = true;
    const uid = user?.uid;
    (uid ? listFarms(uid) : Promise.resolve([])).then((items) => {
      if (active) setFarms(items);
    }).catch((error: unknown) => {
      console.error('Kebun kalkulator gagal dimuat.', error);
      if (active) setFarmsError('Daftar kebun belum dapat dimuat. Periksa koneksi lalu coba lagi.');
    }).finally(() => {
      if (active) setFarmsLoading(false);
    });
    return () => { active = false; };
  }, [user?.uid]);

  const result = useMemo(() => {
    if (!validArea || !validPlants || !crop) return [];
    return crop.rates.map((rate) => {
      const totalKg = rate.kgPerHa * areaHa;
      const perApplicationKg = totalKg / intervalCount;
      return {
        ...rate,
        totalKg,
        perApplicationKg,
        gramsPerPlant: validPlants ? perApplicationKg * 1000 / plantCount : null,
      };
    });
  }, [areaHa, crop, intervalCount, plantCount, validArea, validPlants]);

  const chooseFarm = (farm: Farm) => {
    setSelectedFarm(farm);
    setSelectedFarmCrop(farm.crops[0] ?? '');
    setFarmPickerVisible(false);
  };

  return <Page bottomPadding={32}>
    <View style={s.backRow}>
      <BackButton onPress={() => router.back()} size={44} backgroundColor={c.primarySoft} />
      <View><Text style={s.kicker}>ALAT TANI</Text><Text style={s.title}>Kalkulator pemupukan</Text></View>
    </View>
    <Text style={s.subtitle}>Pilih kebun tersimpan untuk mengisi luas dan tanaman secara otomatis.</Text>

    <View style={s.card}>
      <Text style={s.label}>Kebun</Text>
      <Pressable accessibilityRole="button" onPress={() => setFarmPickerVisible(true)} style={s.selectField}>
        <View style={s.selectCopy}><Text numberOfLines={1} style={[s.selectTitle, !selectedFarm && s.selectPlaceholder]}>{selectedFarm?.name ?? (farmsLoading ? 'Memuat kebun…' : 'Pilih dari Kebun saya')}</Text><Text numberOfLines={1} style={s.selectSubtitle}>{selectedFarm ? selectedFarm.location : `${farms.length} kebun tersimpan`}</Text></View>
        {farmsLoading ? <ActivityIndicator color={c.primary} /> : <Text style={s.selectChevron}>⌄</Text>}
      </Pressable>
      {farmsError ? <Text style={s.error}>{farmsError}</Text> : null}
      {!farmsLoading && farms.length === 0 && !farmsError ? <Pressable onPress={() => router.push('/(app)/(tabs)/farm')} style={s.inlineLink}><Text style={s.inlineLinkText}>Tambah kebun di Kebun saya ›</Text></Pressable> : null}
      {selectedFarm ? <View style={s.readOnlyValue}><Text style={s.readOnlyLabel}>Luas lahan</Text><Text style={s.readOnlyText}>{numberFormat.format(selectedFarm.areaHectares)} hektare</Text></View> : <Text style={s.helper}>Luas diambil dari data kebun yang Anda pilih.</Text>}

      <Text style={[s.label, s.labelGap]}>Jenis komoditas</Text>
      {selectedFarm ? cropOptions.length > 0 ? <View style={s.chips}>{cropOptions.map((item) => <Pressable key={item.farmCrop} onPress={() => setSelectedFarmCrop(item.farmCrop)} accessibilityRole="button" accessibilityState={{ selected: selectedFarmCrop === item.farmCrop }} style={[s.chip, selectedFarmCrop === item.farmCrop && s.chipSelected]}><Text style={[s.chipText, selectedFarmCrop === item.farmCrop && s.chipTextSelected]}>{item.farmCrop}</Text></Pressable>)}</View> : <Text style={s.helper}>Belum ada komoditas pada kebun ini. Tambahkan tanaman melalui Kebun saya.</Text> : <Text style={s.helper}>Pilih kebun terlebih dahulu untuk melihat komoditasnya.</Text>}
      {selectedFarm && cropOptions.some((item) => !item.guide) ? <Text style={s.helper}>Kalkulator belum memiliki acuan untuk semua komoditas di kebun ini.</Text> : null}
      {selectedFarmCrop && !crop ? <Text style={s.error}>Belum tersedia acuan kalkulator untuk “{selectedFarmCrop}”.</Text> : null}

      <Text style={[s.label, s.labelGap]}>Jumlah tanaman</Text>
      <View style={s.inputRow}><TextInput value={plantText} onChangeText={setPlantText} keyboardType="number-pad" placeholder="Contoh: 1000" style={s.input} accessibilityLabel="Jumlah tanaman" /><Text style={s.unit}>pohon / rumpun</Text></View>
      {plantText.length > 0 && !validPlants ? <Text style={s.error}>Masukkan jumlah tanaman berupa bilangan bulat.</Text> : null}
      <Text style={s.helper}>Jumlah ini dipakai untuk membagi taksiran dosis per tanaman.</Text>

      <Text style={[s.label, s.labelGap]}>Periode rencana · interval 10 hari</Text>
      <View style={s.chips}>{periods.map((days) => <Pressable key={days} onPress={() => setPeriodDays(days)} accessibilityRole="button" accessibilityState={{ selected: periodDays === days }} style={[s.chip, periodDays === days && s.chipSelected]}><Text style={[s.chipText, periodDays === days && s.chipTextSelected]}>{days} hari</Text></Pressable>)}</View>

      {selectedFarmCrop && validArea && validPlants ? (
        <View style={s.aiBlock}>
          <Text style={s.aiBlockTitle}>Penyesuaian untuk AI</Text>
          <Text style={s.helper}>Fase dan musim hanya dipakai AI. Acuan standar di bawah tidak berubah.</Text>

          <Text style={[s.label, s.aiLabel]}>Fase tanaman</Text>
          <View style={s.chips}>{PHASES.map((item) => <Pressable key={item.value} onPress={() => setPhase(item.value)} accessibilityRole="button" accessibilityState={{ selected: phase === item.value }} style={[s.chip, phase === item.value && s.chipSelected]}><Text style={[s.chipText, phase === item.value && s.chipTextSelected]}>{item.label}</Text></Pressable>)}</View>
          <Text style={s.helper}>Vegetatif: masa pertumbuhan akar dan daun. Generatif: masa pembungaan dan pembuahan.</Text>

          <Text style={[s.label, s.aiLabel]}>Musim</Text>
          <View style={s.chips}>{SEASONS.map((item) => <Pressable key={item.value} onPress={() => setSeason(item.value)} accessibilityRole="button" accessibilityState={{ selected: season === item.value }} style={[s.chip, season === item.value && s.chipSelected]}><Text style={[s.chipText, season === item.value && s.chipTextSelected]}>{item.label}</Text></Pressable>)}</View>
          <Text style={s.helper}>Terisi otomatis dari bulan ini. Ganti bila musim di daerah Anda berbeda.</Text>

          <Pressable
            accessibilityRole="button"
            disabled={aiLoading}
            onPress={async () => {
              setAiLoading(true);
              setAiError('');
              try {
                const rec = await getAIFertilizerRecommendation({
                  crop: selectedFarmCrop,
                  areaHa,
                  plantCount,
                  periodDays,
                  phase,
                  season,
                });
                setAiCropGuide({
                  name: selectedFarmCrop,
                  rates: rec.fertilizers,
                  source: rec.source,
                  caveat: rec.caveat,
                });
                setAiContext({ phase, season });
              } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Gagal mendapatkan rekomendasi AI';
                setAiError(msg);
                Alert.alert('Error', msg);
              } finally {
                setAiLoading(false);
              }
            }}
            style={[s.aiButton, aiLoading && s.aiButtonLoading]}
          >
            {aiLoading ? <ActivityIndicator color={c.onPrimary} size="small" /> : <Text style={s.aiButtonText}>Dapatkan Rekomendasi AI</Text>}
          </Pressable>
          {aiError ? <Text style={s.error}>{aiError}</Text> : null}
          <Text style={s.helper}>AI menyesuaikan dosis untuk {selectedFarmCrop} pada fase {phaseLabel(phase)} dan {season === 'hujan' ? 'musim hujan' : 'musim kemarau'}.</Text>
        </View>
      ) : null}
      {selectedFarmCrop && crop && aiCropGuide ? (
        <View style={s.aiBadge}>
          <Text style={s.aiBadgeText}>✨ Rekomendasi AI · {selectedFarmCrop}{aiContext ? ` · ${phaseLabel(aiContext.phase)} · ${aiContext.season === 'hujan' ? 'musim hujan' : 'musim kemarau'}` : ''}</Text>
          <Pressable onPress={() => { setAiCropGuide(null); setAiContext(null); }} style={s.aiBadgeDismiss}><Text style={s.aiBadgeDismissText}>Kembali ke acuan standar</Text></Pressable>
        </View>
      ) : null}
    </View>

    <View style={s.resultHeader}><View><Text style={s.sectionTitle}>Perkiraan kebutuhan</Text><Text style={s.helper}>{validArea && validPlants && crop ? `${numberFormat.format(areaHa)} ha · ${numberFormat.format(plantCount)} tanaman · ${crop.name} · ${intervalCount} kali aplikasi` : 'Pilih kebun, komoditas, dan isi jumlah tanaman'}</Text></View></View>
    {validArea && validPlants && crop ? <View style={s.resultCard}>
      {result.map((item, index) => <View key={item.name} style={[s.rateRow, index === result.length - 1 && s.lastRateRow]}>
        <View style={s.rateCopy}><Text style={s.rateName}>{item.name}</Text><Text style={s.rateTotal}>Total {numberFormat.format(item.totalKg)} kg / periode</Text>{item.gramsPerPlant != null ? <Text style={s.helper}>{numberFormat.format(item.gramsPerPlant)} g per tanaman tiap aplikasi</Text> : null}</View>
        <View style={s.doseBadge}><Text style={s.doseValue}>{numberFormat.format(item.perApplicationKg)}</Text><Text style={s.doseUnit}>kg / 10 hari</Text></View>
      </View>)}
      <View style={s.scheduleAccordion}>
        <Text style={s.sectionTitle}>Jadwal rencana</Text>
        <Text style={s.helper}>{intervalCount} jadwal · interval 10 hari · mulai hari ke-10</Text>
      </View>
      <View style={s.scheduleList}>{Array.from({ length: intervalCount }, (_, index) => {
        const day = (index + 1) * 10;
        const expanded = expandedScheduleDays.has(day);
        return <View key={day} style={s.scheduleItem}>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpandedScheduleDays((current) => {
            const next = new Set(current);
            if (next.has(day)) next.delete(day);
            else next.add(day);
            return next;
          })} style={s.scheduleRow}>
            <Text style={s.scheduleDay}>Hari ke-{day}</Text>
            <Text style={s.scheduleChevron}>{expanded ? '−' : '+'}</Text>
          </Pressable>
          {expanded ? <Text style={s.scheduleDoses}>{result.map((item) => `${item.name} ${numberFormat.format(item.perApplicationKg)} kg`).join(' · ')}</Text> : null}
        </View>;
      })}</View>
    </View> : null}

    {crop ? <View style={s.noteCard}><Text style={s.noteTitle}>Catatan penting</Text><Text style={s.noteText}>{crop.caveat} Hasil dibagi rata ke setiap interval 10 hari untuk membantu membuat rencana; ikuti label pupuk dan arahan penyuluh sebelum aplikasi.</Text></View> : null}
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: showMethod }} onPress={() => setShowMethod((value) => !value)} style={s.sourceToggle}><Text style={s.sourceToggleText}>{showMethod ? 'Sembunyikan dasar hitung' : 'Lihat dasar hitung & sumber'}</Text><Text style={s.sourceChevron}>{showMethod ? '−' : '+'}</Text></Pressable>
    {showMethod && crop ? <View style={s.sourceCard}><Text style={s.sourceText}>Dosis per aplikasi = (acuan kg/ha × luas kebun) ÷ jumlah interval 10 hari. Dosis per tanaman = dosis per aplikasi ÷ jumlah tanaman. Acuan komoditas: {crop.source}</Text><Text style={s.sourceCaveat}>Perhitungan ini perkiraan, bukan resep pemupukan spesifik lokasi. Uji tanah, varietas, umur tanaman, jenis pupuk yang tersedia, dan sistem budidaya dapat mengubah kebutuhan.</Text></View> : null}
    <Modal visible={farmPickerVisible} transparent animationType="slide" onRequestClose={() => setFarmPickerVisible(false)}>
      <Pressable style={s.modalBackdrop} onPress={() => setFarmPickerVisible(false)}>
        <Pressable style={s.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}><View><Text style={s.sheetTitle}>Pilih kebun</Text><Text style={s.helper}>Luas dan komoditas mengikuti data kebun.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Tutup" onPress={() => setFarmPickerVisible(false)} style={s.closeButton}><Text style={s.closeText}>×</Text></Pressable></View>
          {farmsLoading ? <ActivityIndicator color={c.primary} style={{ marginVertical: 28 }} /> : farms.length ? <ScrollView style={s.farmList} contentContainerStyle={{ gap: 9, paddingBottom: 18 }}>{farms.map((farm) => <Pressable key={farm.id} onPress={() => chooseFarm(farm)} style={[s.farmOption, selectedFarm?.id === farm.id && s.farmOptionSelected]}><View style={s.farmOptionCopy}><Text style={s.farmOptionTitle}>{farm.name}</Text><Text numberOfLines={1} style={s.farmOptionLocation}>{farm.location}</Text><Text style={s.farmOptionCrop}>{farm.crops.length ? farm.crops.join(' · ') : 'Belum ada komoditas'}</Text></View><View style={s.farmAreaBadge}><Text style={s.farmArea}>{numberFormat.format(farm.areaHectares)}</Text><Text style={s.farmAreaUnit}>ha</Text></View></Pressable>)}</ScrollView> : <View style={s.emptyFarm}><Text style={s.emptyFarmText}>{farmsError || 'Belum ada kebun tersimpan.'}</Text><Pressable onPress={() => { setFarmPickerVisible(false); router.push('/(app)/(tabs)/farm'); }} style={s.inlineLink}><Text style={s.inlineLinkText}>Buka Kebun saya ›</Text></Pressable></View>}
        </Pressable>
      </Pressable>
    </Modal>
  </Page>;
}

const styles = (c: Palette) => StyleSheet.create({
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }, kicker: { color: c.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 }, title: { color: c.textPrimary, fontSize: 20, fontWeight: '800' }, subtitle: { color: c.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 22, padding: 16 }, label: { color: c.textPrimary, fontWeight: '800', fontSize: 14 }, labelGap: { marginTop: 17 }, selectField: { minHeight: 58, borderWidth: 1, borderColor: c.border, borderRadius: 14, flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 13, paddingVertical: 9, backgroundColor: c.surface }, selectCopy: { flex: 1, minWidth: 0 }, selectTitle: { color: c.textPrimary, fontSize: 15, fontWeight: '700' }, selectPlaceholder: { color: c.textSecondary }, selectSubtitle: { color: c.textSecondary, fontSize: 11, marginTop: 3 }, selectChevron: { color: c.primary, fontWeight: '800', fontSize: 22, paddingHorizontal: 4 }, readOnlyValue: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 9, padding: 12, backgroundColor: '#F5F8F6', borderRadius: 12 }, readOnlyLabel: { color: c.textSecondary, fontSize: 12 }, readOnlyText: { color: c.textPrimary, fontSize: 14, fontWeight: '800' }, inlineLink: { alignSelf: 'flex-start', paddingVertical: 9 }, inlineLinkText: { color: c.primary, fontSize: 13, fontWeight: '800' }, inputRow: { minHeight: 52, borderWidth: 1, borderColor: c.border, borderRadius: 14, flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 12 }, input: { flex: 1, color: c.textPrimary, fontSize: 16, paddingVertical: 10 }, unit: { color: c.textSecondary, fontSize: 12 }, helper: { color: c.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 5 }, error: { color: c.danger, fontSize: 12, marginTop: 5 }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }, chip: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 18, backgroundColor: '#F5F7F5', borderWidth: 1, borderColor: c.border }, chipSelected: { backgroundColor: c.primary, borderColor: c.primary }, chipText: { color: c.textSecondary, fontSize: 12, fontWeight: '700' }, chipTextSelected: { color: c.onPrimary },
  resultHeader: { marginTop: 22, marginBottom: 10 }, sectionTitle: { color: c.textPrimary, fontWeight: '800', fontSize: 17 }, resultCard: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 22, padding: 16 }, rateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border }, lastRateRow: { borderBottomWidth: 0 }, rateCopy: { flex: 1 }, rateName: { color: c.textPrimary, fontSize: 14, fontWeight: '800' }, rateTotal: { color: c.textSecondary, fontSize: 12, marginTop: 3 }, doseBadge: { minWidth: 94, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, backgroundColor: '#E8F5EE', borderRadius: 12 }, doseValue: { color: c.primary, fontWeight: '800', fontSize: 15 }, doseUnit: { color: c.primary, fontSize: 9, marginTop: 1 }, scheduleAccordion: { marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: c.border }, scheduleChevron: { color: c.primary, fontWeight: '800', fontSize: 20, paddingHorizontal: 4 }, scheduleList: { gap: 7, marginTop: 10 }, scheduleItem: { borderRadius: 12, backgroundColor: '#F6F8F6', paddingHorizontal: 10 }, scheduleRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, scheduleDay: { color: c.textSecondary, fontSize: 12, fontWeight: '700' }, scheduleDoses: { color: c.textPrimary, fontSize: 11, lineHeight: 17, fontWeight: '600', paddingBottom: 11, paddingRight: 8 }, noteCard: { backgroundColor: c.warningSoft, padding: 14, borderRadius: 16, marginTop: 14 }, noteTitle: { color: '#735019', fontWeight: '800', fontSize: 13 }, noteText: { color: '#735019', fontSize: 12, lineHeight: 18, marginTop: 5 }, sourceToggle: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }, sourceToggleText: { color: c.primary, fontWeight: '800', fontSize: 13 }, sourceChevron: { color: c.primary, fontWeight: '800', fontSize: 19 }, sourceCard: { backgroundColor: '#F5F8F6', borderRadius: 15, padding: 14, marginBottom: 12 }, sourceText: { color: c.textPrimary, fontSize: 12, lineHeight: 18 }, sourceCaveat: { color: c.textSecondary, fontSize: 11, lineHeight: 17, marginTop: 9 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18, 31, 25, 0.38)' }, sheet: { maxHeight: '78%', minHeight: 260, backgroundColor: '#F8FAF8', borderTopLeftRadius: 26, borderTopRightRadius: 26, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 26 }, sheetHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 3, backgroundColor: '#CBD7D0', marginBottom: 15 }, sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }, sheetTitle: { color: c.textPrimary, fontSize: 19, fontWeight: '800' }, closeButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#E8F1EC' }, closeText: { color: c.textPrimary, fontSize: 26, lineHeight: 29 }, farmList: { flexGrow: 0 }, farmOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderRadius: 16, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, padding: 13 }, farmOptionSelected: { borderColor: c.primary, backgroundColor: '#F0F8F3' }, farmOptionCopy: { flex: 1, minWidth: 0 }, farmOptionTitle: { color: c.textPrimary, fontSize: 14, fontWeight: '800' }, farmOptionLocation: { color: c.textSecondary, fontSize: 11, marginTop: 3 }, farmOptionCrop: { color: c.primary, fontSize: 11, fontWeight: '700', marginTop: 6 }, farmAreaBadge: { alignItems: 'center', minWidth: 54, padding: 8, borderRadius: 12, backgroundColor: '#E8F5EE' }, farmArea: { color: c.primary, fontSize: 14, fontWeight: '800' }, farmAreaUnit: { color: c.primary, fontSize: 10 }, emptyFarm: { alignItems: 'center', paddingVertical: 26 }, emptyFarmText: { color: c.textSecondary, fontSize: 14 }, aiBlock: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: c.border }, aiBlockTitle: { color: c.textPrimary, fontWeight: '800', fontSize: 13 }, aiLabel: { marginTop: 12 }, aiButton: { marginTop: 14, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: c.primary, alignItems: 'center' }, aiButtonLoading: { opacity: 0.7 }, aiButtonText: { color: c.onPrimary, fontWeight: '800', fontSize: 14 }, aiBadge: { flexDirection: 'column', alignItems: 'flex-start', gap: 6, marginTop: 10, padding: 10, backgroundColor: '#E8F5EE', borderRadius: 10, borderWidth: 1, borderColor: c.primary }, aiBadgeText: { color: c.primary, fontWeight: '700', fontSize: 12, flexShrink: 1 }, aiBadgeDismiss: { paddingVertical: 2, paddingHorizontal: 0, alignSelf: 'flex-start' }, aiBadgeDismissText: { color: c.primary, fontWeight: '700', fontSize: 11, textDecorationLine: 'underline' },
});
