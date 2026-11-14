import { collection, doc, query, where } from 'firebase/firestore';

import type { Member } from './auth';
import { newestFirst, useDocLive, useLive, type Announcement } from './data';
import { db } from './firebase';

/** Everything the Dean has sent that this member is meant to see, newest first. */
export function useAnnouncements(member: Member | null): Announcement[] | null {
  const uid = member?.id ?? '';
  const intake = member?.intake ?? '';
  const col = collection(db, 'announcements');
  const opp = useDocLive<{ open?: boolean }>('myOpp', () => (uid ? doc(db, 'opportunity', uid) : null), [uid]);
  const isOpen = !!opp?.open;
  const all = useLive<Announcement>('announcements', () => (uid ? query(col, where('audience', '==', 'all')) : null), [uid]);
  const mine = useLive<Announcement>('annIntake', () => (uid ? query(col, where('audience', '==', 'intake'), where('intake', '==', intake)) : null), [uid, intake]);
  const direct = useLive<Announcement>('annPerson', () => (uid ? query(col, where('audience', '==', 'person'), where('uid', '==', uid)) : null), [uid]);
  const open = useLive<Announcement>('annOpen', () => (uid && isOpen ? query(col, where('audience', '==', 'open')) : null), [uid, isOpen]);
  if (!all) return null;
  return newestFirst([...all, ...(mine ?? []), ...(direct ?? []), ...(open ?? [])]);
}
