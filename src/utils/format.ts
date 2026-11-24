// =============================================================================
// Avasthani - Formatter harga dan tanggal (lokal Indonesia, Rupiah)
// =============================================================================

const IDR_FORMATTER = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const DATE_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('id-ID', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Jakarta',
});

/**
 * Format angka ke Rupiah Indonesia. Contoh: 70000 -> "Rp70.000".
 * Mengembalikan string kosong untuk nilai tidak valid.
 */
export function formatRupiah(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) {
    return 'Rp0';
  }
  return IDR_FORMATTER.format(amount);
}

/**
 * Format timestamp (Date / Firestore Timestamp / ISO string) ke bahasa Indonesia.
 * Contoh: "29 Oktober 2026".
 */
export function formatDate(value: any): string {
  const d = toDate(value);
  if (!d) return '-';
  return DATE_FORMATTER.format(d);
}

/**
 * Format timestamp ke tanggal dan waktu WIB.
 */
export function formatDateTime(value: any): string {
  const d = toDate(value);
  if (!d) return '-';
  return DATE_TIME_FORMATTER.format(d);
}

/**
 * Konversi berbagai representasi waktu ke Date. Tidak melempar error.
 */
function toDate(value: any): Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  // Firestore Timestamp memiliki toDate()
  if (typeof value.toDate === 'function') {
    try {
      return value.toDate();
    } catch {
      return null;
    }
  }
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}
