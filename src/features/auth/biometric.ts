// =============================================================================
// Avasthani - Biometrik (kunci aplikasi dengan sidik jari / wajah)
//
// Modulnya memuat kode native. Jika build aplikasi belum menyertakan
// expo-local-authentication (misalnya aplikasi lama yang belum di-rebuild),
// fungsi di sini membalikkan hasil "tidak tersedia" daripada membuat aplikasi
// bermasalah. Itu sebabnya impor memakai import() dinamis di dalam try/catch.
// =============================================================================

type LocalAuth = typeof import('expo-local-authentication');

export type BiometricSupport = {
  /** Benar bila perangkat punya sensor biometrik yang sudah terdaftar. */
  usable: boolean;
  /** Nama jenis biometrik untuk ditampilkan ke pengguna. */
  kindName: string;
  /** Penjelasan bila tidak dapat dipakai. */
  reason?: string;
};

let cachedSupport: BiometricSupport | null = null;

async function loadModule(): Promise<{ mod: LocalAuth | null; reason?: string }> {
  try {
    const mod = (await import('expo-local-authentication')) as LocalAuth;
    return { mod: mod as unknown as LocalAuth };
  } catch {
    return { mod: null, reason: 'Modul biometrik belum ada di build aplikasi ini.' };
  }
}

export async function getBiometricSupport(): Promise<BiometricSupport> {
  if (cachedSupport) return cachedSupport;

  const { mod, reason } = await loadModule();
  if (!mod) {
    cachedSupport = { usable: false, kindName: 'Biometrik', reason };
    return cachedSupport;
  }

  try {
    const [hasHardware, enrolled, types] = await Promise.all([
      mod.hasHardwareAsync(),
      mod.isEnrolledAsync(),
      mod.supportedAuthenticationTypesAsync(),
    ]);

    const kindName = types.includes(mod.AuthenticationType.FACIAL_RECOGNITION)
      ? 'wajah'
      : types.includes(mod.AuthenticationType.FINGERPRINT)
        ? 'sidik jari'
        : types.includes(mod.AuthenticationType.IRIS)
          ? 'iris'
          : 'biometrik';

    let usable = hasHardware && enrolled;
    let reasonText: string | undefined;
    if (!hasHardware) reasonText = `Perangkat ini tidak memiliki sensor ${kindName}.`;
    else if (!enrolled) reasonText = `Belum ada ${kindName} yang terdaftar. Daftarkan di pengaturan HP.`;

    cachedSupport = { usable, kindName, reason: reasonText };
    return cachedSupport;
  } catch {
    cachedSupport = { usable: false, kindName: 'Biometrik', reason: 'Sensor biometrik tidak dapat dibaca.' };
    return cachedSupport;
  }
}

/** Minta autentikasi. Benar bila pengguna berhasil memverifikasi diri. */
export async function authenticateBiometric(kindName = 'biometrik'): Promise<boolean> {
  const { mod } = await loadModule();
  if (!mod) return false;

  try {
    const result = await mod.authenticateAsync({
      promptMessage: `Buka Avasthani (${kindName})`,
      cancelLabel: 'Batal',
      disableDeviceFallback: false,
    });
    return result.success;
  } catch {
    return false;
  }
}
