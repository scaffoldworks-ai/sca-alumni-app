import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { ADMIN_EMAILS, auth, db } from './firebase';

export type MemberStatus = 'pending' | 'approved' | 'declined';

export type Member = {
  id: string;
  name: string;
  email: string;
  intake: string;
  note?: string;
  status: MemberStatus;
  role?: string;
  employer?: string;
  city?: string;
  discipline?: string;
  portfolio?: string;
  /** True only when the member is open to opportunities AND has chosen to show that to all alumni. */
  openPublic?: boolean;
};

type AuthState = {
  loading: boolean;
  user: User | null;
  member: Member | null;
  /** The signed-in address is on the admin list, verified or not. */
  isAdminEmail: boolean;
  /** Admin powers are active: on the list and the address has been verified. */
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  loading: true,
  user: null,
  member: null,
  isAdminEmail: false,
  isAdmin: false,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [verified, setVerified] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [memberReady, setMemberReady] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setVerified(!!u?.emailVerified);
        setAuthReady(true);
        if (!u) {
          setMember(null);
          setMemberReady(true);
        } else {
          setMemberReady(false);
        }
      }),
    [],
  );

  useEffect(() => {
    if (!user) return;
    return onSnapshot(
      doc(db, 'members', user.uid),
      (snap) => {
        setMember(snap.exists() ? ({ id: snap.id, ...snap.data() } as Member) : null);
        setMemberReady(true);
      },
      () => {
        setMember(null);
        setMemberReady(true);
      },
    );
  }, [user]);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    // A fresh token is needed before the database sees the address as verified.
    await auth.currentUser.getIdToken(true);
    setVerified(!!auth.currentUser.emailVerified);
  }, []);

  const email = user?.email?.toLowerCase() ?? '';
  const isAdminEmail = ADMIN_EMAILS.includes(email);
  const isAdmin = isAdminEmail && verified;

  // The Dean does not wait in his own queue.
  useEffect(() => {
    if (isAdmin && member && member.status !== 'approved') {
      updateDoc(doc(db, 'members', member.id), { status: 'approved' }).catch(() => {});
    }
  }, [isAdmin, member]);

  const value = useMemo(
    () => ({ loading: !authReady || !memberReady, user, member, isAdminEmail, isAdmin, refreshUser }),
    [authReady, memberReady, user, member, isAdminEmail, isAdmin, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function initials(name: string | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email already has an account. Try signing in.';
    case 'auth/invalid-email':
      return "That doesn't look like an email address.";
    case 'auth/weak-password':
      return 'Choose a password of at least six characters.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return "That email and password don't match.";
    case 'auth/too-many-requests':
      return 'Too many tries. Wait a minute and try again.';
    case 'auth/network-request-failed':
      return "Can't reach the server. Check your connection.";
    default:
      return 'Something went wrong. Please try again.';
  }
}
