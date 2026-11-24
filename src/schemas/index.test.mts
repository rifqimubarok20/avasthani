import assert from 'node:assert/strict';
import test from 'node:test';
import { businessProfileSchema, loginSchema, productSchema, registerSchema } from './index.ts';

test('login requires a valid email and password', () => {
  assert.equal(loginSchema.safeParse({ email: 'buyer@example.com', password: 'password123' }).success, true);
  assert.equal(loginSchema.safeParse({ email: 'buyer', password: 'short' }).success, false);
});

test('registration requires matching passwords', () => {
  const base = { fullName: 'Dewi Sari', email: 'dewi@example.com', password: 'password123' };
  assert.equal(registerSchema.safeParse({ ...base, confirmPassword: 'password123' }).success, true);
  assert.equal(registerSchema.safeParse({ ...base, confirmPassword: 'wrongpass' }).success, false);
});

test('business profile accepts buyer and supplier signup roles only', () => {
  const profile = { displayName: 'Dewi Sari', businessName: 'Tani Makmur', phoneNumber: '081234567890', province: 'Jawa Barat', city: 'Garut', addressLine: 'Jalan Mawar 1' };
  assert.equal(businessProfileSchema.safeParse({ ...profile, role: 'BUYER' }).success, true);
  assert.equal(businessProfileSchema.safeParse({ ...profile, role: 'OPERATOR' }).success, false);
});

test('product form validates an indicative listing and allows omitted stock/price', () => {
  const base = { name: 'Tomat merah', categoryId: 'sayuran', baseUnit: 'kg', availabilityStatus: 'AVAILABLE', city: 'Bandung' };
  assert.equal(productSchema.safeParse(base).success, true);
  assert.equal(productSchema.safeParse({ ...base, indicativeStock: '0', indicativePricePerUnit: '12500' }).success, true);
  assert.equal(productSchema.safeParse({ ...base, indicativeStock: '-1' }).success, false);
  assert.equal(productSchema.safeParse({ ...base, categoryId: '' }).success, false);
});
