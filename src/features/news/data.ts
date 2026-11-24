export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  glyph: string;
  tint: string;
  publishedAt: string;
  readMinutes: number;
}

const day = 24 * 60 * 60 * 1000;
export const NEWS_REFERENCE_TIME = Date.now();

// Seed content for the news experience until a verified publisher feed is connected.
export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'soil-moisture', category: 'Tanah', title: 'Kenali kelembapan tanah sebelum pemupukan',
    summary: 'Kondisi kelembapan membantu menentukan waktu dan cara pemupukan agar unsur hara dapat diserap tanaman dengan lebih baik.',
    glyph: '🌱', tint: '#E5F2E6', publishedAt: new Date(NEWS_REFERENCE_TIME - day * 0.4).toISOString(), readMinutes: 3,
  },
  {
    id: 'rain-planting', category: 'Cuaca', title: 'Atur jadwal tanam mengikuti prakiraan hujan',
    summary: 'Memantau peluang hujan beberapa hari ke depan dapat membantu petani merencanakan penyiraman dan kegiatan tanam.',
    glyph: '🌦️', tint: '#E4F1F8', publishedAt: new Date(NEWS_REFERENCE_TIME - day * 2).toISOString(), readMinutes: 4,
  },
  {
    id: 'soil-health', category: 'Budidaya', title: 'Cara menjaga tanah tetap subur sepanjang musim',
    summary: 'Rotasi tanaman, bahan organik, dan pengelolaan air menjadi bagian penting dalam merawat kesuburan lahan.',
    glyph: '🌾', tint: '#FFF0D5', publishedAt: new Date(NEWS_REFERENCE_TIME - day * 5).toISOString(), readMinutes: 3,
  },
  {
    id: 'post-harvest', category: 'Panen', title: 'Langkah sederhana menjaga mutu hasil panen',
    summary: 'Penanganan yang tepat setelah panen dapat membantu menjaga kualitas produk sebelum disimpan atau dipasarkan.',
    glyph: '🧺', tint: '#F7EBDD', publishedAt: new Date(NEWS_REFERENCE_TIME - day * 12).toISOString(), readMinutes: 5,
  },
  {
    id: 'market-planning', category: 'Pasar', title: 'Siapkan hasil tani sebelum memasuki pasar',
    summary: 'Penyortiran, pencatatan jumlah, dan kemasan yang sesuai memudahkan proses penawaran hasil pertanian.',
    glyph: '📦', tint: '#EAF0FF', publishedAt: new Date(NEWS_REFERENCE_TIME - day * 24).toISOString(), readMinutes: 4,
  },
  {
    id: 'water-management', category: 'Budidaya', title: 'Mengelola air dengan bijak di area pertanian',
    summary: 'Mengenali kebutuhan tanaman dan kondisi lahan membantu penggunaan air lebih terencana.',
    glyph: '💧', tint: '#E4F1F8', publishedAt: new Date(NEWS_REFERENCE_TIME - day * 42).toISOString(), readMinutes: 3,
  },
];

export function formatNewsDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatNewsAge(value: string) {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  const hours = Math.floor(elapsed / (60 * 60 * 1000));
  if (hours < 1) return 'Baru saja';
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}
