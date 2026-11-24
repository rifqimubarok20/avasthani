// =============================================================================
// Avasthani - Konten belajar (Avasthani Academy & Kamus Tani)
//
// Isi ditulis sendiri dan sengaja dijaga singkat serta aplikatif.
// Bukan pengganti arahan penyuluh atau hasil uji tanah.
// =============================================================================

export type Lesson = {
  id: string;
  title: string;
  level: 'Pemula' | 'Menengah';
  minutes: number;
  summary: string;
  glyph: string;
  tint: string;
  points: string[];
};

export const LESSONS: Lesson[] = [
  {
    id: 'dasar-hara',
    title: 'Dasar pemupukan: kenali N, P, dan K',
    level: 'Pemula',
    minutes: 6,
    summary: 'Tiga hara utama dan perannya bagi tanaman, supaya tidak asal menebar pupuk.',
    glyph: '🌿',
    tint: '#E5F2E6',
    points: [
      'Nitrogen (N) mendorong pertumbuhan daun dan batang. Berlebih membuat tanaman rimbun tapi lemah dan mudah terserang penyakit.',
      'Fosfor (P) berperan pada pembentukan akar dan proses pembungaan. Kekurangan P membuat akar lemah dan pertumbuhan kerdil.',
      'Kalium (K) menguatkan batang, membantu pembentukan buah, dan meningkatkan ketahanan terhadap kekeringan.',
      'Keseimbangan lebih penting daripada jumlah. Pupuk majemuk seperti NPK memberi ketiganya sekaligus dengan perbandingan tertentu.',
    ],
  },
  {
    id: 'fase-tanaman',
    title: 'Menyesuaikan pupuk dengan fase tanaman',
    level: 'Pemula',
    minutes: 5,
    summary: 'Fase vegetatif dan generatif menuntut perbandingan hara yang berbeda.',
    glyph: '🌱',
    tint: '#E8F4EC',
    points: [
      'Fase vegetatif: tanaman membangun akar, batang, dan daun. Kebutuhan N relatif lebih tinggi, tetapi jangan berlebihan.',
      'Fase generatif: tanaman beralih ke pembungaan dan pembuahan. Kebutuhan P dan K naik, sementara N dikurangi agar tidak rimbun berlebihan.',
      'Perhatikan tanda di lapangan: daun menguning seragam biasanya kurang N; tepi daun terbakar bisa jadi gejala kekurangan K.',
      'Pergantian fase tidak selalu serentak pada semua tanaman di satu petak, jadi amati dulu sebelum mengubah dosis.',
    ],
  },
  {
    id: 'hitung-dosis',
    title: 'Menghitung dosis pupuk per tanaman',
    level: 'Menengah',
    minutes: 8,
    summary: 'Dari rekomendasi kg per hektare menjadi gram per pohon yang bisa langsung ditakar.',
    glyph: '🧮',
    tint: '#FFF4DB',
    points: [
      'Mulai dari dosis acuan dalam kg per hektare, lalu kalikan dengan luas lahan Anda untuk mendapat total kebutuhan.',
      'Bagi total dengan jumlah tanaman untuk mendapat dosis per tanaman.',
      'Contoh: 300 kg/ha pada lahan 0,5 ha dan 1.000 tanaman menghasilkan 150 kg total, atau 150 gram per tanaman.',
      'Takar dengan alat yang konsisten. Gelas bekas air mineral kurang lebih 200 gram untuk pupuk butiran, tetapi selalu verifikasi dengan timbangan.',
    ],
  },
  {
    id: 'musim',
    title: 'Pemupukan di musim hujan dan kemarau',
    level: 'Menengah',
    minutes: 7,
    summary: 'Cara membagi dosis dan memilih waktu aplikasi agar pupuk tidak terbuang.',
    glyph: '⛅',
    tint: '#E4F0F6',
    points: [
      'Musim hujan: nitrogen mudah tercuci. Bagi dosis menjadi beberapa aplikasi kecil dan hindari memupuk tepat sebelum hujan lebat.',
      'Musim hujan: pastikan saluran drainase lancar. Genangan membuat akar kekurangan oksigen dan pupuk tidak terserap.',
      'Musim kemarau: aplikasikan pagi atau sore agar tidak menguap. Pastikan tanah cukup lembap sebelum memupuk.',
      'Bahan organik membantu tanah menahan air dan hara, terutama pada lahan yang sering kekeringan.',
    ],
  },
  {
    id: 'jenis-pupuk',
    title: 'Pupuk majemuk, tunggal, dan pembenah tanah',
    level: 'Pemula',
    minutes: 6,
    summary: 'Membedakan jenis pupuk dan kapan masing-masing dipakai.',
    glyph: '🧴',
    tint: '#F2EAF7',
    points: [
      'Pupuk tunggal hanya membawa satu hara utama, misalnya nitrogen saja atau fosfor saja. Cocok bila hasil uji tanah menunjukkan satu hara tertentu yang kurang.',
      'Pupuk majemuk membawa dua hara atau lebih dalam satu butir, misalnya NPK 16-16-16. Lebih praktis dan lebih merata.',
      'Pembenah tanah seperti dolomit, kieserit, dan asam humat memperbaiki sifat tanah, bukan menggantikan pupuk hara.',
      'Dolomit menaikkan pH tanah sekaligus memasok magnesium dan kalsium. Kieserit memasok magnesium dan sulfur.',
    ],
  },
  {
    id: 'ukur-luas',
    title: 'Mengukur luas kebun dengan benar',
    level: 'Pemula',
    minutes: 4,
    summary: 'Luas yang salah membuat seluruh perhitungan dosis ikut salah.',
    glyph: '📏',
    tint: '#FFF0E8',
    points: [
      'Untuk petak persegi, kalikan panjang dan lebar dalam meter, lalu bagi 10.000 untuk mendapat hektare.',
      'Untuk petak tidak beraturan, pecah menjadi beberapa bentuk sederhana lalu jumlahkan.',
      'Aplikasi Avasthani dapat menandai batas kebun di peta dan menghitung luasnya secara otomatis.',
      'Perbarui luas bila ada perluasan atau pengurangan lahan, karena dosis mengikuti angka ini.',
    ],
  },
];

export type GlossaryEntry = {
  term: string;
  definition: string;
  category: 'Hara' | 'Pupuk' | 'Tanah' | 'Budidaya';
};

export const GLOSSARY: GlossaryEntry[] = [
  { term: 'Andisol', category: 'Tanah', definition: 'Tanah vulkanik berwarna gelap yang umum di dataran tinggi. Umumnya subur, tetapi fosfor sering terikat sehingga perlu pengelolaan khusus.' },
  { term: 'Asam humat', category: 'Pupuk', definition: 'Bahan organik hasil dekomposisi yang membantu mengikat hara dan memperbaiki struktur tanah. Bukan sumber hara utama.' },
  { term: 'BWD (Bagan Warna Daun)', category: 'Budidaya', definition: 'Alat sederhana untuk menilai kecukupan nitrogen padi dengan membandingkan warna daun terhadap skala warna.' },
  { term: 'Dolomit', category: 'Pupuk', definition: 'Pupuk pembenah tanah berbahan kalsium magnesium karbonat. Menaikkan pH tanah sekaligus memasok magnesium.' },
  { term: 'Dosis', category: 'Pupuk', definition: 'Jumlah pupuk yang diberikan per satuan luas atau per tanaman, biasanya dinyatakan dalam kg per hektare atau gram per pohon.' },
  { term: 'Generatif', category: 'Budidaya', definition: 'Fase tanaman saat beralih dari pertumbuhan menjadi pembungaan dan pembuahan. Kebutuhan fosfor dan kalium meningkat.' },
  { term: 'Hara makro', category: 'Hara', definition: 'Unsur hara yang dibutuhkan tanaman dalam jumlah besar: nitrogen, fosfor, kalium, kalsium, magnesium, dan sulfur.' },
  { term: 'Hara mikro', category: 'Hara', definition: 'Unsur hara yang dibutuhkan dalam jumlah kecil tetapi tetap penting, seperti boron, seng, besi, mangan, dan tembaga.' },
  { term: 'Interval aplikasi', category: 'Pupuk', definition: 'Jarak waktu antar pemupukan, misalnya setiap 10 hari. Interval pendek membuat hara lebih tersedia merata.' },
  { term: 'Kalium (K)', category: 'Hara', definition: 'Hara yang berperan pada pembentukan buah, penguatan batang, dan ketahanan tanaman terhadap kekeringan.' },
  { term: 'Kieserit', category: 'Pupuk', definition: 'Pupuk magnesium sulfat. Memasok magnesium dan sulfur tanpa mengubah pH tanah secara berarti.' },
  { term: 'Kompos', category: 'Pupuk', definition: 'Pupuk organik hasil pengomposan bahan tanaman atau kotoran ternak. Memperbaiki struktur dan kehidupan biologis tanah.' },
  { term: 'Latosol', category: 'Tanah', definition: 'Tanah merah kekuningan hasil pelapukan lanjut. Sering kekurangan bahan organik dan perlu pemupukan berimbang.' },
  { term: 'Mulsa', category: 'Budidaya', definition: 'Lapisan penutup tanah dari jerami, plastik, atau daun kering untuk menahan kelembapan dan menekan gulma.' },
  { term: 'Nitrogen (N)', category: 'Hara', definition: 'Hara utama untuk pertumbuhan daun dan batang. Mudah tercuci oleh air, terutama di musim hujan.' },
  { term: 'NPK', category: 'Pupuk', definition: 'Pupuk majemuk yang mengandung nitrogen, fosfor, dan kalium. Angka seperti 16-16-16 menunjukkan persentase tiap hara.' },
  { term: 'pH tanah', category: 'Tanah', definition: 'Tingkat keasaman tanah. Sebagian besar tanaman pangan tumbuh optimal pada pH 6 sampai 7. Terlalu asam membuat hara sulit diserap.' },
  { term: 'Pupuk lepas lambat', category: 'Pupuk', definition: 'Pupuk yang melepaskan hara secara bertahap sehingga tidak mudah tercuci. Berguna pada musim hujan.' },
  { term: 'Pupuk majemuk', category: 'Pupuk', definition: 'Pupuk yang mengandung dua unsur hara atau lebih dalam satu butir, misalnya NPK 15-15-15.' },
  { term: 'Pupuk organik', category: 'Pupuk', definition: 'Pupuk berasal dari bahan alami seperti kompos, pupuk kandang, atau residu tanaman. Kadar haranya rendah tetapi memperbaiki tanah.' },
  { term: 'Pupuk tunggal', category: 'Pupuk', definition: 'Pupuk yang mengandung satu unsur hara utama, misalnya urea untuk nitrogen atau SP-36 untuk fosfor.' },
  { term: 'Rotasi tanaman', category: 'Budidaya', definition: 'Mengganti jenis tanaman antar musim pada lahan yang sama untuk memutus siklus hama dan menjaga keseimbangan hara.' },
  { term: 'Tumpang sari', category: 'Budidaya', definition: 'Menanam dua jenis tanaman atau lebih pada satu petak secara bersamaan, dengan pengaturan jarak dan waktu tanam.' },
  { term: 'Uji tanah', category: 'Tanah', definition: 'Pemeriksaan contoh tanah di laboratorium untuk mengetahui pH, kandungan hara, dan sifat tanah lainnya sebagai dasar pemupukan.' },
  { term: 'Vegetatif', category: 'Budidaya', definition: 'Fase pertumbuhan akar, batang, dan daun. Kebutuhan nitrogen relatif lebih tinggi dibanding fase generatif.' },
  { term: 'Zeolit', category: 'Pupuk', definition: 'Mineral alami berpori yang dapat menyerap dan menyimpan hara, sering dicampur ke pupuk untuk mengurangi kehilangan nitrogen.' },
];
