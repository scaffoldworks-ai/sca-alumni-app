import { Redirect, useRouter } from 'expo-router';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useAuth, type Member } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { intakeYears } from '@/lib/intakes';
import { usePendingMembers } from '@/lib/members';
import { Avatar, BackLink, Body, Button, C, ErrorText, F, H1, Label, Pill, Screen } from '@/ui';

type OpenRow = { id: string; name: string; intake: string; visibility: 'team' | 'all' };

function useOpenToWork(enabled: boolean) {
  const [rows, setRows] = useState<OpenRow[] | null>(null);
  useEffect(() => {
    if (!enabled) return;
    return onSnapshot(
      query(collection(db, 'opportunity'), where('open', '==', true)),
      (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as OpenRow).sort((a, b) => a.name.localeCompare(b.name))),
      () => setRows([]),
    );
  }, [enabled]);
  return rows;
}

function Request({ m, onError }: { m: Member; onError: (msg: string) => void }) {
  const [busy, setBusy] = useState<'' | 'approved' | 'declined'>('');
  async function decide(status: 'approved' | 'declined') {
    setBusy(status);
    onError('');
    try {
      await updateDoc(doc(db, 'members', m.id), { status });
    } catch {
      onError(`Couldn't update ${m.name}. Try again.`);
      setBusy('');
    }
  }
  return (
    <View style={{ borderWidth: 1, borderColor: C.line, borderRadius: 18, padding: 18, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={m.name} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 17, letterSpacing: -0.3, color: C.ink }}>{m.name}</Text>
          <Label style={{ marginTop: 4 }}>{`${m.intake} · ${intakeYears(m.intake)}`}</Label>
        </View>
      </View>
      <Text selectable style={{ fontFamily: F.semi, fontSize: 13.5, color: C.ink, marginTop: 14 }}>{m.email}</Text>
      {m.note ? (
        <View style={{ backgroundColor: C.soft, borderRadius: 12, padding: 14, marginTop: 12 }}>
          <Label>They said</Label>
          <Text style={{ fontFamily: F.medium, fontSize: 14, lineHeight: 21, color: C.ink, marginTop: 6 }}>{m.note}</Text>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <Button title="Approve" onPress={() => decide('approved')} busy={busy === 'approved'} disabled={busy === 'declined'} style={{ flex: 1, height: 50, marginRight: 10 }} />
        <Button title="Decline" kind="ghost" onPress={() => decide('declined')} busy={busy === 'declined'} disabled={busy === 'approved'} style={{ flex: 1, height: 50 }} />
      </View>
    </View>
  );
}

export default function Dean() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const pending = usePendingMembers(isAdmin);
  const open = useOpenToWork(isAdmin);
  const [tab, setTab] = useState<'queue' | 'open'>('queue');
  const [error, setError] = useState('');

  if (!isAdmin) return <Redirect href="/home" />;

  return (
    <Screen>
      <BackLink onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
      <Label>Dean&apos;s desk</Label>
      <View style={{ height: 10 }} />
      <H1>{tab === 'queue' ? 'Who gets *in.*' : 'Who is *looking.*'}</H1>
      <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 14 }}>
        <Pill title={`Waiting${pending ? ` · ${pending.length}` : ''}`} active={tab === 'queue'} onPress={() => setTab('queue')} />
        <Pill title={`Open to work${open ? ` · ${open.length}` : ''}`} active={tab === 'open'} onPress={() => setTab('open')} />
      </View>
      <ErrorText>{error}</ErrorText>

      {tab === 'queue' ? (
        <>
          {pending && pending.length === 0 ? <Body>Nobody waiting. New requests land here the moment they&apos;re sent.</Body> : null}
          {(pending ?? []).map((m) => (
            <Request key={m.id} m={m} onError={setError} />
          ))}
        </>
      ) : (
        <>
          {open && open.length === 0 ? <Body>Nobody has switched this on yet.</Body> : null}
          {(open ?? []).map((r) => (
            <Pressable key={r.id} onPress={() => router.push(`/member/${r.id}`)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.line }}>
              <Avatar name={r.name} size={44} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ fontFamily: F.bold, fontSize: 15.5, letterSpacing: -0.2, color: C.ink }}>{r.name}</Text>
                <Label style={{ marginTop: 4 }}>{r.intake}</Label>
              </View>
              <Label color={r.visibility === 'all' ? C.ink : C.red}>{r.visibility === 'all' ? 'All alumni' : 'Only you'}</Label>
            </Pressable>
          ))}
        </>
      )}
    </Screen>
  );
}
