import { arrayRemove, arrayUnion, doc, setDoc } from 'firebase/firestore';

import { useDocLive } from './data';
import { db } from './firebase';

/** The people this member has blocked. Private: nobody else, including the person blocked, can see it. */
export function useBlocked(uid: string | undefined): string[] {
  const row = useDocLive<{ blocked?: string[] }>('settings', () => (uid ? doc(db, 'settings', uid) : null), [uid ?? '']);
  return row?.blocked ?? [];
}

export function setBlocked(uid: string, other: string, blocked: boolean) {
  return setDoc(doc(db, 'settings', uid), { blocked: blocked ? arrayUnion(other) : arrayRemove(other) }, { merge: true });
}
