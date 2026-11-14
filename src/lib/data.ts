import { collection, doc, onSnapshot, query, where, type DocumentReference, type Query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { db } from './firebase';
import { MOCK, MOCK_DATA } from './mock';

type Stamp = { seconds: number } | null | undefined;

export type Job = {
  id: string;
  title: string;
  company: string;
  location?: string;
  kind?: string;
  description?: string;
  link?: string;
  postedBy: string;
  postedByName: string;
  status: 'pending' | 'live' | 'declined' | 'closed';
  marcSays?: string;
  createdAt?: Stamp;
};

export type Interest = {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  uid: string;
  name: string;
  intake: string;
  note?: string;
  status: 'new' | 'introduced';
  createdAt?: Stamp;
};

export type EventItem = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  place?: string;
  description?: string;
  link?: string;
};

export type Going = { id: string; name: string; intake: string };

export type Message = { id: string; uid: string; name: string; text: string; createdAt?: Stamp };

export type Dm = { id: string; members: string[]; names: Record<string, string>; lastText?: string; updatedAt?: Stamp };

export const KINDS = ['Full-time', 'Freelance', 'Contract', 'Placement'];

export function newestFirst<T extends { createdAt?: Stamp }>(list: T[]): T[] {
  const t = (x: T) => x.createdAt?.seconds ?? Number.MAX_SAFE_INTEGER;
  return [...list].sort((a, b) => t(b) - t(a));
}

/** Live list from a query. Returns null while loading, [] if it cannot be read. */
export function useLive<T>(mockKey: string, make: () => Query | null, deps: unknown[]): T[] | null {
  const [rows, setRows] = useState<T[] | null>(MOCK ? ((MOCK_DATA[mockKey] ?? []) as T[]) : null);
  useEffect(() => {
    if (MOCK) return;
    const q = make();
    if (!q) return;
    return onSnapshot(
      q,
      (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T)),
      () => setRows([]),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return rows;
}

/** Live single record. undefined while loading, null if missing or unreadable. */
export function useDocLive<T>(mockKey: string, make: () => DocumentReference | null, deps: unknown[]): T | null | undefined {
  const [row, setRow] = useState<T | null | undefined>(MOCK ? ((MOCK_DATA[mockKey] ?? null) as T | null) : undefined);
  useEffect(() => {
    if (MOCK) return;
    const ref = make();
    if (!ref) return;
    return onSnapshot(
      ref,
      (snap) => setRow(snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null),
      () => setRow(null),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return row;
}

export const liveJobs = () => query(collection(db, 'jobs'), where('status', '==', 'live'));
export const jobRef = (id: string) => doc(db, 'jobs', id);

export function dmId(a: string, b: string) {
  return [a, b].sort().join('_');
}

export function formatDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function today(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/** Accepts 12/12/2026, 12-12-26 or 12.12.2026 and returns 2026-12-12, or '' if it is not a real date. */
export function parseUkDate(input: string): string {
  const m = input.trim().match(/^(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{2}|\d{4})$/);
  if (!m) return '';
  const d = Number(m[1]);
  const mo = Number(m[2]);
  const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return '';
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
