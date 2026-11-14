import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import type { Member } from './auth';
import { db } from './firebase';

/** Live list of approved members, sorted by name. */
export function useApprovedMembers() {
  const [members, setMembers] = useState<Member[] | null>(null);
  useEffect(
    () =>
      onSnapshot(
        query(collection(db, 'members'), where('status', '==', 'approved')),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Member);
          list.sort((a, b) => a.name.localeCompare(b.name));
          setMembers(list);
        },
        () => setMembers([]),
      ),
    [],
  );
  return members;
}

/** Live list of people waiting for approval. Admin only. */
export function usePendingMembers(enabled: boolean) {
  const [members, setMembers] = useState<Member[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    return onSnapshot(
      query(collection(db, 'members'), where('status', '==', 'pending')),
      (snap) => setMembers(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Member)),
      () => setMembers([]),
    );
  }, [enabled]);
  return enabled ? members : null;
}

export function workLine(m: Pick<Member, 'role' | 'employer'>): string {
  if (m.role && m.employer) return `${m.role}, ${m.employer}`;
  return m.role || m.employer || '';
}
