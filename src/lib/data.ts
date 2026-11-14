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

export type Announcement = {
  id: string;
  body: string;
  audience: 'all' | 'intake' | 'open' | 'person';
  intake?: string;
  uid?: string;
  toName?: string;
  createdAt?: Stamp;
};

export type ClassItem = { id: string; title: string; mentor?: string; topic?: string; url: string; minutes?: string; createdAt?: Stamp };

export type Dm = { id: string; members: string[]; names: Record<string, string>; lastText?: string; updatedAt?: Stamp };

export const KINDS = ['Full-time', 'Freelance', 'Contract', 'Placement'];

export function newestFirst<T extends { createdAt?: Stamp }>(list: T[]): T[] {
  const t = (x: T) => x.createdAt?.seconds ?? Number.MAX_SAFE_INTEGER;
  return [...list].sort((a, b) => t(b) - t(a));
}

// ---------------------------------------------------------------------------
// Shared live data. Each distinct query is opened once and kept open for a few
// minutes after the last screen stops using it, so going back to a screen shows
// what was already there instantly instead of fetching it again.
// ---------------------------------------------------------------------------

type Entry = { value: unknown; has: boolean; listeners: Set<(v: unknown) => void>; stop: () => void; timer?: ReturnType<typeof setTimeout> };
const live = new Map<string, Entry>();
const KEEP_MS = 5 * 60 * 1000;

/** Forget everything. Called when someone signs in or out. */
export function clearLiveData() {
  live.forEach((e) => {
    if (e.timer) clearTimeout(e.timer);
    e.stop();
  });
  live.clear();
}

function watch(key: string, start: (emit: (v: unknown) => void) => () => void, cb: (v: unknown) => void) {
  let e = live.get(key);
  if (!e) {
    const entry: Entry = { value: undefined, has: false, listeners: new Set(), stop: () => {} };
    live.set(key, entry);
    entry.stop = start((v) => {
      entry.value = v;
      entry.has = true;
      entry.listeners.forEach((l) => l(v));
    });
    e = entry;
  }
  const entry = e;
  if (entry.timer) clearTimeout(entry.timer);
  entry.listeners.add(cb);
  if (entry.has) cb(entry.value);
  return () => {
    entry.listeners.delete(cb);
    if (entry.listeners.size === 0) {
      entry.timer = setTimeout(() => {
        entry.stop();
        if (live.get(key) === entry) live.delete(key);
      }, KEEP_MS);
    }
  };
}

function useWatched<T>(mockKey: string, deps: unknown[], loading: T, start: ((emit: (v: unknown) => void) => () => void) | null): T {
  const key = `${mockKey}|${JSON.stringify(deps)}`;
  const cached = live.get(key);
  const [state, setState] = useState<{ key: string; value: T }>({ key, value: cached?.has ? (cached.value as T) : loading });
  useEffect(() => {
    if (MOCK || !start) return;
    return watch(key, start, (v) => setState({ key, value: v as T }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, start === null]);
  if (MOCK) return (MOCK_DATA[mockKey] ?? loading) as T;
  if (state.key !== key) return cached?.has ? (cached.value as T) : loading;
  return state.value;
}

/** Live list from a query. Returns null while loading, [] if it cannot be read. */
export function useLive<T>(mockKey: string, make: () => Query | null, deps: unknown[]): T[] | null {
  const q = MOCK ? null : make();
  const rows = useWatched<T[] | null>(
    mockKey,
    deps,
    null,
    q
      ? (emit) =>
          onSnapshot(
            q,
            (snap) => emit(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
            () => emit([]),
          )
      : null,
  );
  if (MOCK) return (rows ?? []) as T[];
  return rows;
}

/** Live single record. undefined while loading, null if missing or unreadable. */
export function useDocLive<T>(mockKey: string, make: () => DocumentReference | null, deps: unknown[]): T | null | undefined {
  const ref = MOCK ? null : make();
  const row = useWatched<T | null | undefined>(
    mockKey,
    deps,
    undefined,
    ref
      ? (emit) =>
          onSnapshot(
            ref,
            (snap) => emit(snap.exists() ? { id: snap.id, ...snap.data() } : null),
            () => emit(null),
          )
      : null,
  );
  if (MOCK) return (row ?? null) as T | null;
  return row;
}

export const liveJobs = () => query(collection(db, 'jobs'), where('status', '==', 'live'));
export const jobRef = (id: string) => doc(db, 'jobs', id);

export function ago(stamp: Stamp): string {
  if (!stamp?.seconds) return 'Just now';
  const mins = Math.max(0, Math.floor((Date.now() / 1000 - stamp.seconds) / 60));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`;
  const days = Math.floor(mins / (60 * 24));
  if (days < 7) return `${days}d ago`;
  return new Date(stamp.seconds * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

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
