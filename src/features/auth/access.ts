export type AccessState = {
  authenticated: boolean;
  hasProfile: boolean;
  role?: string | null;
  userStatus?: string;
  verificationStatus?: string;
};

export function destinationForAccess(state: AccessState): string {
  if (!state.authenticated) return '/(auth)/login';
  if (state.role === 'SUPER_ADMIN') return '/(app)/operator';
  if (state.userStatus === 'SUSPENDED') return '/(app)/account-status';
  return '/(app)/(tabs)/home';
}

export function isAuthRoute(segment: string | undefined): boolean {
  return segment === '(auth)' || segment === 'onboarding';
}

export function roleAllows(role: string | null, required: 'BUYER' | 'SUPPLIER' | 'OPERATOR'): boolean {
  if (required === 'OPERATOR') return role === 'OPERATOR' || role === 'SUPER_ADMIN';
  return role === required || role === 'SUPER_ADMIN';
}
