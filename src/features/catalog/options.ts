import type { Category, Unit } from '@/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'sayuran', name: 'Sayuran', active: true, sortOrder: 1, createdAt: null, updatedAt: null },
  { id: 'buah', name: 'Buah', active: true, sortOrder: 2, createdAt: null, updatedAt: null },
  { id: 'umbi', name: 'Umbi-umbian', active: true, sortOrder: 3, createdAt: null, updatedAt: null },
  { id: 'rempah', name: 'Rempah', active: true, sortOrder: 4, createdAt: null, updatedAt: null },
  { id: 'biji', name: 'Biji-bijian', active: true, sortOrder: 5, createdAt: null, updatedAt: null },
  { id: 'lainnya', name: 'Lainnya', active: true, sortOrder: 6, createdAt: null, updatedAt: null },
];
export const DEFAULT_UNITS: Unit[] = [
  { id: 'kg', name: 'kg', createdAt: null, updatedAt: null },
  { id: 'gram', name: 'gram', createdAt: null, updatedAt: null },
  { id: 'ton', name: 'ton', createdAt: null, updatedAt: null },
  { id: 'ikat', name: 'ikat', createdAt: null, updatedAt: null },
  { id: 'karung', name: 'karung', createdAt: null, updatedAt: null },
  { id: 'peti', name: 'peti', createdAt: null, updatedAt: null },
  { id: 'pcs', name: 'pcs', createdAt: null, updatedAt: null },
];
