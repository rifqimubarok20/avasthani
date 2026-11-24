// =============================================================================
// Avasthani - AI fertilizer recommendation (Cloud Function)
//
// API key provider AI disimpan sebagai secret server-side, tidak pernah dikirim
// ke aplikasi mobile. Client memanggil fungsi ini lewat callable function.
//
// Set secret sebelum deploy:
//   firebase functions:secrets:set GROQ_API_KEY
// =============================================================================

import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const groqApiKey = defineSecret('GROQ_API_KEY');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Model gratis pada Groq Free plan. Ganti bila kuota/model berubah.
const MODEL = 'openai/gpt-oss-120b';
const REQUEST_TIMEOUT_MS = 25_000;
// Batas harian per pengguna agar kuota gratis tidak dihabiskan satu akun.
const DAILY_LIMIT = 20;

// Skema strict: Groq menjamin output selalu JSON valid sesuai bentuk ini.
const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    fertilizers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          kgPerHa: { type: 'number' },
        },
        required: ['name', 'kgPerHa'],
        additionalProperties: false,
      },
    },
    source: { type: 'string' },
    caveat: { type: 'string' },
  },
  required: ['fertilizers', 'source', 'caveat'],
  additionalProperties: false,
} as const;

if (getApps().length === 0) {
  initializeApp();
}

export type FertilizerRecommendation = {
  fertilizers: { name: string; kgPerHa: number }[];
  source: string;
  caveat: string;
};

function requireString(value: unknown, field: string, min: number, max: number): string {
  if (typeof value !== 'string') {
    throw new HttpsError('invalid-argument', `Field ${field} harus berupa teks.`);
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new HttpsError('invalid-argument', `Field ${field} tidak valid.`);
  }
  return trimmed;
}

function requireNumber(value: unknown, field: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new HttpsError('invalid-argument', `Field ${field} harus berupa angka.`);
  }
  if (value < min || value > max) {
    throw new HttpsError('invalid-argument', `Field ${field} di luar rentang yang wajar.`);
  }
  return value;
}

// Fase tanaman dan musim dipakai untuk menyesuaikan dosis. Sifatnya opsional
// supaya versi aplikasi lama yang belum mengirim field ini tetap jalan.
const PLANT_PHASES = ['vegetatif', 'generatif'] as const;
const SEASONS = ['hujan', 'kemarau'] as const;

type PlantPhase = (typeof PLANT_PHASES)[number];
type Season = (typeof SEASONS)[number];

function optionalEnum<T extends string>(
  value: unknown,
  field: string,
  allowed: readonly T[]
): T | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new HttpsError(
      'invalid-argument',
      `Field ${field} harus salah satu dari: ${allowed.join(', ')}.`
    );
  }
  return value as T;
}

function parseRecommendation(raw: string): FertilizerRecommendation {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new HttpsError('internal', 'Respons AI tidak bisa dibaca. Coba lagi.');
  }

  const data = parsed as Partial<FertilizerRecommendation>;
  const fertilizers = Array.isArray(data.fertilizers)
    ? data.fertilizers
        .map((item) => ({
          name: typeof item?.name === 'string' ? item.name.trim() : '',
          kgPerHa: Number(item?.kgPerHa),
        }))
        .filter((item) => item.name.length > 0 && Number.isFinite(item.kgPerHa) && item.kgPerHa > 0)
    : [];

  if (fertilizers.length === 0) {
    throw new HttpsError('internal', 'AI tidak mengembalikan dosis pupuk yang valid. Coba lagi.');
  }

  return {
    fertilizers,
    source: typeof data.source === 'string' ? data.source : 'Rekomendasi AI',
    caveat:
      typeof data.caveat === 'string'
        ? data.caveat
        : 'Sesuaikan dengan hasil uji tanah dan arahan penyuluh.',
  };
}

// Pupuk tunggal yang tidak boleh dipakai: preferensi produk memakai pupuk majemuk.
const FORBIDDEN_FERTILIZER_PATTERNS = [
  /\burea\b/i,
  /\bza\b/i,
  /\bsp[\s-]?36\b/i,
  /\bsp[\s-]?18\b/i,
  /\btsp\b/i,
];

function isForbiddenFertilizer(name: string): boolean {
  return FORBIDDEN_FERTILIZER_PATTERNS.some((pattern) => pattern.test(name));
}

function utcDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function assertWithinDailyQuota(uid: string): Promise<void> {
  const db = getFirestore();
  const ref = db.collection('aiUsage').doc(`${uid}_${utcDayKey(new Date())}`);

  const used = await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    const current = snapshot.exists ? Number(snapshot.get('count') ?? 0) : 0;
    if (current >= DAILY_LIMIT) {
      return current;
    }
    tx.set(
      ref,
      { uid, count: current + 1, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    return current + 1;
  });

  if (used > DAILY_LIMIT) {
    throw new HttpsError(
      'resource-exhausted',
      `Batas harian ${DAILY_LIMIT} rekomendasi AI sudah tercapai. Coba lagi besok.`
    );
  }
}

async function requestGroq(apiKey: string, prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 2048,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'fertilizer_recommendation',
            strict: true,
            schema: RESPONSE_SCHEMA,
          },
        },
        messages: [
          {
            role: 'system',
            content:
              'Anda ahli agronomi Indonesia. Tulis SEMUA teks dalam Bahasa Indonesia yang sederhana dan mudah dipahami petani. Jawab HANYA dengan objek JSON valid tanpa penjelasan tambahan.',
          },
          { role: 'user', content: prompt },
        ],
      }),
      signal: controller.signal,
    });
  } catch {
    throw new HttpsError('unavailable', 'Tidak bisa menghubungi layanan AI. Coba lagi.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text();
    console.error('Groq API error', response.status, body.slice(0, 500));
    if (response.status === 401 || response.status === 403) {
      throw new HttpsError('failed-precondition', 'Layanan AI belum dikonfigurasi dengan benar.');
    }
    if (response.status === 429) {
      throw new HttpsError('resource-exhausted', 'Kuota AI sedang penuh. Coba lagi beberapa saat.');
    }
    throw new HttpsError('unavailable', 'Layanan AI sedang bermasalah. Coba lagi nanti.');
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? '';
  if (!content.trim()) {
    throw new HttpsError('internal', 'AI tidak memberikan jawaban. Coba lagi.');
  }
  return content;
}

export const getFertilizerRecommendation = onCall(
  { secrets: [groqApiKey], region: 'asia-southeast2', timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Silakan masuk terlebih dahulu.');
    }

    const crop = requireString(request.data?.crop, 'crop', 2, 60);
    const areaHa = requireNumber(request.data?.areaHa, 'areaHa', 0.0001, 100_000);
    const plantCount = Math.round(requireNumber(request.data?.plantCount, 'plantCount', 1, 10_000_000));
    const periodDays = Math.round(requireNumber(request.data?.periodDays, 'periodDays', 1, 365));
    const intervalCount = Math.round(periodDays / 10);
    const phase = optionalEnum<PlantPhase>(request.data?.phase, 'phase', PLANT_PHASES);
    const season = optionalEnum<Season>(request.data?.season, 'season', SEASONS);

    const apiKey = groqApiKey.value();
    if (!apiKey) {
      throw new HttpsError('failed-precondition', 'Layanan AI belum dikonfigurasi.');
    }

    await assertWithinDailyQuota(request.auth.uid);

    const phaseLine =
      phase === 'vegetatif'
        ? '- Fase tanaman: vegetatif (masa pertumbuhan akar, batang, dan daun)'
        : phase === 'generatif'
          ? '- Fase tanaman: generatif (masa pembungaan dan pembuahan)'
          : '';

    const seasonLine =
      season === 'hujan'
        ? '- Musim: hujan'
        : season === 'kemarau'
          ? '- Musim: kemarau'
          : '';

    // Panduan agronomi umum per fase dan musim. Ditulis sebagai aturan supaya
    // model tidak hanya mengulang dosis yang sama untuk semua kondisi.
    const phaseRule =
      phase === 'vegetatif'
        ? '- Fase vegetatif: utamakan N dan P untuk pertumbuhan akar, batang, dan daun; jangan memberi N berlebihan'
        : phase === 'generatif'
          ? '- Fase generatif: utamakan P dan K untuk pembungaan dan pembuahan; kurangi porsi N agar tidak rimbun berlebihan'
          : '';

    const seasonRule =
      season === 'hujan'
        ? '- Musim hujan: N mudah tercuci, bagi dosis lebih merata dan hindari aplikasi saat hujan lebat; waspada drainase dan penyakit jamur'
        : season === 'kemarau'
          ? '- Musim kemarau: aplikasi pagi atau sore agar tidak menguap, pastikan air cukup, dan tambahkan bahan organik penahan air'
          : '';

    const contextLines = [
      `- Tanaman: ${crop}`,
      `- Luas lahan: ${areaHa} hektare`,
      `- Jumlah tanaman: ${plantCount}`,
      `- Periode tanam: ${periodDays} hari (${intervalCount} interval 10 hari)`,
      phaseLine,
      seasonLine,
    ]
      .filter(Boolean)
      .join('\n');

    const ruleLines = [
      '- Gunakan HANYA pupuk majemuk dan pembenah tanah, contoh: NPK 16-16-16, NPK 15-15-15, NPK 13-6-27, NPK 12-12-17, NPK + mikro, Kieserit (MgSO4), Magnesium sulfat, Dolomit, Asam humat, pupuk organik/kompos, pupuk mikro (Borax, ZnSO4)',
      '- DILARANG memakai pupuk tunggal: Urea, ZA, SP-36, TSP, SP-18',
      '- Jumlah jenis pupuk 3-5 jenis',
      '- Dosis kg/ha harus realistis untuk Indonesia',
      '- Gunakan nama pupuk umum di Indonesia',
      phaseRule,
      seasonRule,
      '- source: sebutkan referensi umum dalam Bahasa Indonesia (contoh: "Rekomendasi Kementan, disesuaikan kondisi lahan")',
      '- caveat: tulis dalam Bahasa Indonesia, ingatkan uji tanah, label pupuk, arahan penyuluh, serta sesuaikan dengan fase tanaman dan musim',
    ]
      .filter(Boolean)
      .join('\n');

    const prompt = `Berikan rekomendasi pemupukan untuk:
${contextLines}

Keluarkan HANYA JSON valid dengan format:
{
  "fertilizers": [
    { "name": "Nama pupuk", "kgPerHa": number }
  ],
  "source": "Sumber referensi singkat",
  "caveat": "Catatan penting untuk petani"
}

Aturan wajib:
${ruleLines}`;

    const reminder = `

PENTING: Jangan pernah memakai Urea, ZA, SP-36, TSP, atau SP-18. Ganti dengan pupuk majemuk seperti NPK 16-16-16, ditambah magnesium (Kieserit/Dolomit), asam humat, atau pupuk organik.`;

    let recommendation = parseRecommendation(await requestGroq(apiKey, prompt));
    if (recommendation.fertilizers.some((item) => isForbiddenFertilizer(item.name))) {
      // Model kadang tetap memakai pupuk tunggal; minta sekali lagi dengan penegasan.
      recommendation = parseRecommendation(await requestGroq(apiKey, `${prompt}${reminder}`));
    }

    const allowed = recommendation.fertilizers.filter((item) => !isForbiddenFertilizer(item.name));
    if (allowed.length === 0) {
      throw new HttpsError(
        'internal',
        'AI menyarankan pupuk yang tidak diizinkan. Silakan coba lagi.'
      );
    }

    return { ...recommendation, fertilizers: allowed };
  }
);
