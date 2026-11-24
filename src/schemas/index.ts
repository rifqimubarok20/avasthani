import { z } from 'zod';

const email = z.string().trim().email('Masukkan alamat email yang valid.');
const password = z.string().min(8, 'Kata sandi minimal 8 karakter.');

export const loginSchema = z.object({ email, password });
export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Nama minimal 2 karakter.'),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Konfirmasi kata sandi belum sama.',
  });
export const businessProfileSchema = z.object({
  displayName: z.string().trim().min(2, 'Nama minimal 2 karakter.'),
  businessName: z.string().trim().min(2, 'Nama usaha minimal 2 karakter.'),
  role: z.enum(['BUYER', 'SUPPLIER']),
  phoneNumber: z.string().trim().min(8, 'Nomor telepon belum valid.'),
  province: z.string().trim().min(2, 'Provinsi wajib diisi.'),
  city: z.string().trim().min(2, 'Kabupaten/kota wajib diisi.'),
  district: z.string().trim().optional(),
  addressLine: z.string().trim().min(4, 'Alamat wajib diisi.'),
});

const optionalText = (max: number) => z.preprocess(
  (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
  z.string().trim().max(max).optional(),
);
const optionalNonNegativeNumber = (label: string) => z.preprocess(
  (value) => value === '' || value === undefined || value === null ? undefined : Number(value),
  z.number({ invalid_type_error: `${label} harus berupa angka.` }).finite().min(0, `${label} tidak boleh negatif.`).optional(),
);

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Nama produk minimal 2 karakter.').max(80, 'Nama produk maksimal 80 karakter.'),
  categoryId: z.string().trim().min(1, 'Pilih kategori produk.'),
  description: optionalText(500),
  baseUnit: z.string().trim().min(1, 'Pilih satuan produk.'),
  grade: optionalText(80),
  indicativeStock: optionalNonNegativeNumber('Stok indikatif'),
  indicativePricePerUnit: optionalNonNegativeNumber('Harga indikatif'),
  availabilityStatus: z.enum(['AVAILABLE', 'LIMITED', 'UNAVAILABLE']),
  city: z.string().trim().min(2, 'Kota wajib diisi.'),
  district: optionalText(80),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
export type ProductInput = z.infer<typeof productSchema>;
