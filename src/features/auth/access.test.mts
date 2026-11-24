import assert from 'node:assert/strict';
import test from 'node:test';
import { destinationForAccess, roleAllows } from './access.ts';

test('signed-out users go to login', () => {
  assert.equal(destinationForAccess({ authenticated: false, hasProfile: false }), '/(auth)/login');
});

test('new accounts enter the home tab before completing their profile', () => {
  assert.equal(destinationForAccess({ authenticated: true, hasProfile: false }), '/(app)/(tabs)/home');
});

test('pending and rejected businesses can still enter the app', () => {
  assert.equal(destinationForAccess({ authenticated: true, hasProfile: true, userStatus: 'PENDING_VERIFICATION', verificationStatus: 'PENDING' }), '/(app)/(tabs)/home');
  assert.equal(destinationForAccess({ authenticated: true, hasProfile: true, userStatus: 'ACTIVE', verificationStatus: 'REJECTED' }), '/(app)/(tabs)/home');
});

test('suspended accounts and verified users are routed separately', () => {
  assert.equal(destinationForAccess({ authenticated: true, hasProfile: true, userStatus: 'SUSPENDED', verificationStatus: 'VERIFIED' }), '/(app)/account-status');
  assert.equal(destinationForAccess({ authenticated: true, hasProfile: true, userStatus: 'ACTIVE', verificationStatus: 'VERIFIED' }), '/(app)/(tabs)/home');
});

test('role guards keep buyer, supplier, and operator areas separate', () => {
  assert.equal(roleAllows('BUYER', 'BUYER'), true);
  assert.equal(roleAllows('BUYER', 'SUPPLIER'), false);
  assert.equal(roleAllows('SUPPLIER', 'OPERATOR'), false);
  assert.equal(roleAllows('SUPER_ADMIN', 'OPERATOR'), true);
});
