import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Text } from '@/components/AppText';
import { useColors } from '@/theme/ThemeProvider';
import type { Palette } from '@/theme/tokens';

const slides = [
  { icon: '🌱', title: 'Kebun Anda, tercatat rapi', text: 'Simpan luas lahan, jumlah tanaman, dan komoditas setiap kebun dalam satu tempat.' },
  { icon: '📅', title: 'Jadwal dan dosis pemupukan', text: 'Hitung kebutuhan pupuk per interval 10 hari, lengkap dengan rekomendasi dosis dari AI.' },
  { icon: '⛅', title: 'Cuaca dan kabar tani', text: 'Pantau prakiraan cuaca di sekitar kebun serta berita pertanian terbaru.' },
  { icon: '🤝', title: 'Pasarkan hasil panen', text: 'Hubungkan hasil bumi Anda dengan pembeli dan pemasok usaha yang tepat.' },
];

export default function Onboarding() {
  const c = useColors();
  const styles = stylesFor(c);
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();
  const pager = useRef<ComponentRef<typeof ScrollView>>(null);
  const finish = async () => { await AsyncStorage.setItem('onboarding-complete', 'true'); router.replace('/(auth)/login'); };
  const goTo = (next: number) => { setIndex(next); pager.current?.scrollTo({ x: width * next, animated: true }); };
  return <View style={styles.page}>
    <ScrollView ref={pager} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / width))} style={{ flex: 1, marginHorizontal: -24 }}>
      {slides.map((slide) => <View key={slide.title} style={{ width, paddingHorizontal: 24, flex: 1 }}>
        <View style={styles.illustration}><View style={styles.circle}><Text style={styles.icon}>{slide.icon}</Text></View><View style={styles.leaf} /></View>
        <View style={styles.copy}><Text style={styles.title}>{slide.title}</Text><Text style={styles.text}>{slide.text}</Text></View>
      </View>)}
    </ScrollView>
    <View style={styles.dots}>{slides.map((slide, item) => <View key={slide.title} style={[styles.dot, item === index && styles.activeDot]} />)}</View>
    <Pressable accessibilityRole="button" style={styles.button} onPress={() => index < slides.length - 1 ? goTo(index + 1) : void finish()}><Text style={styles.buttonText}>{index < slides.length - 1 ? 'Lanjut' : 'Mulai'}</Text></Pressable>
    {index > 0 ? <Pressable accessibilityRole="button" style={styles.back} onPress={() => goTo(index - 1)}><Text style={styles.backText}>Kembali</Text></Pressable> : <Pressable accessibilityRole="button" style={styles.back} onPress={() => void finish()}><Text style={styles.backText}>Lewati</Text></Pressable>}
  </View>;
}

const stylesFor = (c: Palette) => StyleSheet.create({ page: { flex: 1, backgroundColor: c.background, padding: 24, paddingTop: 32 }, illustration: { flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center' }, circle: { width: 220, height: 220, borderRadius: 110, backgroundColor: c.primarySoft, justifyContent: 'center', alignItems: 'center' }, icon: { fontSize: 78, color: c.primary }, leaf: { position: 'absolute', height: 10, width: 60, borderRadius: 20, backgroundColor: c.accent, right: '20%', bottom: '24%', transform: [{ rotate: '-25deg' }] }, copy: { alignItems: 'center', paddingHorizontal: 12, minHeight: 125 }, title: { color: c.textPrimary, fontSize: 26, fontWeight: '800', textAlign: 'center' }, text: { color: c.textSecondary, fontSize: 15, lineHeight: 23, textAlign: 'center', marginTop: 12 }, dots: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginVertical: 22 }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.border }, activeDot: { width: 22, backgroundColor: c.primary }, button: { height: 52, borderRadius: 10, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: c.onPrimary, fontSize: 16, fontWeight: '700' }, back: { height: 46, alignItems: 'center', justifyContent: 'center' }, backText: { color: c.textSecondary, fontSize: 14, fontWeight: '600' } });
