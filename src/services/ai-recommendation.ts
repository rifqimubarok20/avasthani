// =============================================================================
// Avasthani - AI fertilizer recommendation (client)
//
// Pemanggilan dilakukan lewat Cloud Function `getFertilizerRecommendation`
// supaya API key provider AI tetap di server dan kuota bisa dibatasi per user.
// =============================================================================

import { callFunction } from './callable-functions';

export type AIFertilizerRecommendation = {
  fertilizers: {
    name: string;
    kgPerHa: number;
  }[];
  source: string;
  caveat: string;
};

/** Fase tanaman yang dipakai AI untuk menyesuaikan dosis. */
export type PlantPhase = 'vegetatif' | 'generatif';

/** Musim tanam; memengaruhi cara dosis dibagi dan waktu aplikasi. */
export type GrowingSeason = 'hujan' | 'kemarau';

type CallableError = {
  code?: string;
  message?: string;
};

function describeError(error: unknown): string {
  const { code = '', message = '' } = (error ?? {}) as CallableError;

  switch (code) {
    case 'functions/unauthenticated':
      return 'Silakan masuk terlebih dahulu untuk memakai rekomendasi AI.';
    case 'functions/invalid-argument':
      return message || 'Data yang dikirim tidak valid. Periksa kembali isian kalkulator.';
    case 'functions/resource-exhausted':
      return message || 'Batas pemakaian AI tercapai. Coba lagi nanti.';
    case 'functions/failed-precondition':
      return 'Layanan AI belum dikonfigurasi. Hubungi admin aplikasi.';
    case 'functions/unavailable':
      return 'Layanan AI sedang tidak tersedia. Periksa koneksi lalu coba lagi.';
    case 'functions/internal':
      return message || 'AI gagal membuat rekomendasi. Coba lagi.';
    default:
      return 'Gagal mendapatkan rekomendasi AI. Periksa koneksi internet lalu coba lagi.';
  }
}

export async function getAIFertilizerRecommendation(params: {
  crop: string;
  areaHa: number;
  plantCount: number;
  periodDays: number;
  phase?: PlantPhase;
  season?: GrowingSeason;
}): Promise<AIFertilizerRecommendation> {
  try {
    return await callFunction<typeof params, AIFertilizerRecommendation>(
      'getFertilizerRecommendation',
      params
    );
  } catch (error) {
    throw new Error(describeError(error));
  }
}
