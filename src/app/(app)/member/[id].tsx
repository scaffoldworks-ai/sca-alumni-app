import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';

import type { Member } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { intakeYears } from '@/lib/intakes';
import { workLine } from '@/lib/members';
import { Avatar, BackLink, Body, Button, C, F, H1, Hairline, Label, Screen } from '@/ui';

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={{ paddingVertical: 14 }}>
      <Label>{label}</Label>
      <Text style={{ fontFamily: F.semi, fontSize: 16, letterSpacing: -0.2, color: C.ink, marginTop: 5 }}>{value}</Text>
    </View>
  );
}

export default function MemberProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [m, setM] = useState<Member | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    setM(undefined);
    return onSnapshot(
      doc(db, 'members', id),
      (snap) => setM(snap.exists() ? ({ id: snap.id, ...snap.data() } as Member) : null),
      () => setM(null),
    );
  }, [id]);

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

      {portfolio ? <Button title="See their work" kind="ghost" onPress={() => Linking.openURL(portfolio)} style={{ marginTop: 20 }} /> : null}
    </Screen>
  );
}
