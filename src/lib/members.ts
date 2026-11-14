import { collection, query, where } from 'firebase/firestore';

import type { Member } from './auth';
import { useLive } from './data';
import { db } from './firebase';

/** Live list of approved members, sorted by name. */
export function useApprovedMembers() {
  const rows = useLive<Member>('approved', () => query(collection(db, 'members'), where('status', '==', 'approved')), []);
  return rows ? [...rows].sort((a, b) => a.name.localeCompare(b.name)) : null;
}

/** Live list of people waiting for approval. Admin only. */
export function usePendingMembers(enabled: boolean) {
  return useLive<Member>('pending', () => (enabled ? query(collection(db, 'members'), where('status', '==', 'pending')) : null), [enabled]);
}

export function workLine(m: Pick<Member, 'role' | 'employer'>): string {
  if (m.role && m.employer) return `${m.role}, ${m.employer}`;
  return m.role || m.employer || '';
}
