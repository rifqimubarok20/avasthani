import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { getIdTokenResult, onAuthStateChanged, type User } from '@react-native-firebase/auth';
import { collection, doc, onSnapshot, query, where } from '@react-native-firebase/firestore';
import { getFirebaseAuth } from '@/services/firebase/auth';
import { getFirebaseFirestore } from '@/services/firebase/firestore';
import { loadAccount, type AccountData } from '@/services/profile';

type AuthContextValue = {
  user: User | null;
  account: AccountData;
  loading: boolean;
  refresh: () => Promise<void>;
};

const emptyAccount: AccountData = { profile: null, business: null, role: null };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<AccountData>(emptyAccount);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(async () => setVersion((value) => value + 1), []);

  useEffect(() => {
    let active = true;
    let stopProfile: (() => void) | undefined;
    let stopMembership: (() => void) | undefined;
    let stopBusiness: (() => void) | undefined;
    let stopAuth: (() => void) | undefined;
    let authGeneration = 0;

    void getFirebaseAuth().then((auth) => {
      if (!active) return;
      stopAuth = onAuthStateChanged(auth, async (nextUser) => {
        const generation = ++authGeneration;
        const isCurrentSession = () => active && generation === authGeneration;
        stopProfile?.(); stopMembership?.(); stopBusiness?.();
        stopProfile = undefined; stopMembership = undefined; stopBusiness = undefined;
        setUser(nextUser);
        if (!nextUser) {
          setAccount(emptyAccount);
          setLoading(false);
          return;
        }
        setLoading(true);
        try {
          const token = await getIdTokenResult(nextUser);
          const isSuperAdmin = token.claims.admin === true;
          // Admin dibuat di Firebase Authentication dan tidak harus memiliki
          // dokumen profil/membership bisnis di Firestore.
          if (isSuperAdmin) {
            if (!isCurrentSession()) return;
            setAccount({ ...emptyAccount, role: 'SUPER_ADMIN' });
            setLoading(false);
            return;
          }
          const initialAccount = await loadAccount(nextUser);
          if (!isCurrentSession()) return;
          setAccount(initialAccount);
          setLoading(false);
          const db = await getFirebaseFirestore();
          stopProfile = onSnapshot(doc(db, 'users', nextUser.uid), (snapshot) => {
            if (!isCurrentSession()) return;
            setAccount((value) => ({ ...value, profile: snapshot.exists() ? snapshot.data() as AccountData['profile'] : null }));
          }, (error) => {
            if (isCurrentSession()) console.error('Listener profil akun gagal', error);
          });
          stopMembership = onSnapshot(query(collection(db, 'businessMemberships'), where('userId', '==', nextUser.uid)), async (snapshot) => {
            if (!isCurrentSession()) return;
            const membership = snapshot.docs[0]?.data() as { businessId: string; role: AccountData['role'] } | undefined;
            if (!membership) { setAccount((value) => ({ ...value, business: null, role: null })); return; }
            stopBusiness?.();
            stopBusiness = onSnapshot(doc(db, 'businesses', membership.businessId), (businessSnapshot) => {
              if (isCurrentSession()) setAccount((value) => ({ ...value, role: membership.role, business: businessSnapshot.exists() ? businessSnapshot.data() as AccountData['business'] : null }));
            }, (error) => {
              if (isCurrentSession()) console.error('Listener bisnis akun gagal', error);
            });
          }, (error) => {
            if (isCurrentSession()) console.error('Listener membership akun gagal', error);
          });
        } catch {
          if (isCurrentSession()) { setAccount(emptyAccount); setLoading(false); }
        }
      });
    }).catch(() => { if (active) setLoading(false); });

    return () => {
      active = false;
      stopAuth?.(); stopProfile?.(); stopMembership?.(); stopBusiness?.();
    };
  }, [version]);

  const value = useMemo(() => ({ user, account, loading, refresh }), [user, account, loading, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth harus digunakan di dalam AuthProvider.');
  return value;
}
