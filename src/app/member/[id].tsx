import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Linking, Text, View } from 'react-native';

import { Gate } from '@/components/gate';
import { useAuth, type Member } from '@/lib/auth';
import { dmId, useDocLive } from '@/lib/data';
import { db } from '@/lib/firebase';
import { intakeYears } from '@/lib/intakes';
import { workLine } from '@/lib/members';
import { setBlocked, useBlocked } from '@/lib/safety';
import { Avatar, BackLink, Body, Button, C, F, Field, H1, Hairline, Label, Screen } from '@/ui';

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={{ paddingVertical: 14 }}>
      <Label>{label}</Label>
      <Text style={{ fontFamily: F.semi, fontSize: 16, letterSpacing: -0.2, color: C.ink, marginTop: 5 }}>{value}</Text>
    </View>
  );
}

export default function MemberProfileScreen() {
  return (
    <Gate>
      <MemberProfile />
    </Gate>
  );
}

function MemberProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { member: me, isAdmin } = useAuth();
  const m = useDocLive<Member>('member', () => (id ? doc(db, 'members', id) : null), [id]);
  const [busy, setBusy] = useState(false);
  const blocked = useBlocked(me?.id);
  const [panel, setPanel] = useState(false);
  const [reason, setReason] = useState('');
  const [sent, setSent] = useState(false);

  async function report() {
    if (!me || !m || !reason.trim()) return;
    try {
      await addDoc(collection(db, 'reports'), { by: me.id, byName: me.name, about: m.id, aboutName: m.name, where: 'profile', text: '', reason: reason.trim(), status: 'new', createdAt: serverTimestamp() });
      setSent(true);
      setReason('');
    } catch {
      // Leave what they typed so they can try again.
    }
  }

  async function message() {
    if (!me || !m) return;
    setBusy(true);
    const chat = dmId(me.id, m.id);
    try {
      await setDoc(doc(db, 'dms', chat), { members: [me.id, m.id].sort(), names: { [me.id]: me.name, [m.id]: m.name }, updatedAt: serverTimestamp() }, { merge: true });
      router.push(`/chat/dm_${chat}`);
    } catch {
      // Stay on the profile; the button can simply be tapped again.
    } finally {
      setBusy(false);
    }
  }

  const back = () => (router.canGoBack() ? router.back() : router.replace('/people'));

  if (m === undefined) return <Screen><BackLink onPress={back} /></Screen>;
  if (m === null) {
    return (
      <Screen>
        <BackLink onPress={back} />
        <Body>This profile isn&apos;t available.</Body>
      </Screen>
    );
  }

  const portfolio = m.portfolio ? (/^https?:\/\//i.test(m.portfolio) ? m.portfolio : `https://${m.portfolio}`) : '';

  return (
    <Screen>
      <BackLink onPress={back} title="People" />
      <Avatar name={m.name} size={84} dark />
      <View style={{ height: 20 }} />
      <Label>{`${m.intake} · ${intakeYears(m.intake)}`}</Label>
      <View style={{ height: 8 }} />
      <H1 size={36}>{m.name}</H1>
      {workLine(m) ? <Body color={C.ink} style={{ marginTop: 10, fontFamily: F.semi }}>{workLine(m)}</Body> : null}

      {m.openPublic ? (
        <View style={{ backgroundColor: C.soft, borderRadius: 14, padding: 16, marginTop: 22, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: C.red, marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 14, color: C.ink }}>Open to opportunities</Text>
            <Text style={{ fontFamily: F.medium, fontSize: 12.5, lineHeight: 18, color: C.grey, marginTop: 2 }}>Got something? Tell Marc and he&apos;ll make the introduction.</Text>
          </View>
        </View>
      ) : null}

      <Hairline style={{ marginTop: 24, marginBottom: 6 }} />
      <Row label="Role" value={m.role} />
      <Row label="Works at" value={m.employer} />
      <Row label="Craft" value={m.discipline} />
      <Row label="Based in" value={m.city} />
      {!m.role && !m.employer && !m.discipline && !m.city ? <Body style={{ marginTop: 14 }}>{m.name.split(' ')[0]} hasn&apos;t filled in their profile yet.</Body> : null}

      {me && m.id !== me.id && !blocked.includes(m.id) ? <Button title={`Message ${m.name.split(' ')[0]}`} kind="dark" onPress={message} busy={busy} style={{ marginTop: 24 }} /> : null}
      {isAdmin && me && m.id !== me.id ? <Button title="Send a note from the Dean" kind="ghost" onPress={() => router.push({ pathname: '/announce', params: { to: m.id, name: m.name } })} style={{ marginTop: 12 }} /> : null}
      {portfolio ? <Button title="See their work" kind="ghost" onPress={() => Linking.openURL(portfolio)} style={{ marginTop: 12 }} /> : null}
      {me && m.id !== me.id ? (
        panel ? (
          <View style={{ backgroundColor: C.soft, borderRadius: 14, padding: 16, marginTop: 24 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 14.5, color: C.ink }}>{blocked.includes(m.id) ? `You've blocked ${m.name.split(' ')[0]}` : `Block ${m.name.split(' ')[0]}`}</Text>
            <Body style={{ fontSize: 12.5, lineHeight: 18, marginTop: 2 }}>You won&apos;t see their messages or chats with them. They aren&apos;t told.</Body>
            <Button title={blocked.includes(m.id) ? 'Unblock' : 'Block'} kind="dark" onPress={() => setBlocked(me.id, m.id, !blocked.includes(m.id)).catch(() => {})} style={{ height: 46, marginTop: 12, marginBottom: 18 }} />
            {sent ? (
              <Text style={{ fontFamily: F.bold, fontSize: 14.5, color: C.ink }}>Sent to Marc. He&apos;ll look into it.</Text>
            ) : (
              <>
                <Field label="Report to Marc" value={reason} onChangeText={setReason} placeholder="What happened?" multiline style={{ backgroundColor: C.white }} />
                <Button title="Send report" kind="ghost" onPress={report} disabled={!reason.trim()} style={{ height: 46 }} />
              </>
            )}
            <Button title="Close" kind="quiet" onPress={() => setPanel(false)} />
          </View>
        ) : (
          <Button title="Report or block" kind="quiet" onPress={() => setPanel(true)} style={{ marginTop: 14, alignSelf: 'flex-start', paddingHorizontal: 0 }} />
        )
      ) : null}
    </Screen>
  );
}
