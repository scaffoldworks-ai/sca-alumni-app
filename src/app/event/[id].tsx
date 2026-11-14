import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import { Gate } from '@/components/gate';
import { useAuth } from '@/lib/auth';
import { formatDay, useDocLive, useLive, type EventItem, type Going } from '@/lib/data';
import { db } from '@/lib/firebase';
import { Avatar, BackLink, Body, Button, C, ErrorText, F, H1, Hairline, Label, Screen } from '@/ui';

export default function EventScreen() {
  return (
    <Gate>
      <EventDetail />
    </Gate>
  );
}

function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { member, isAdmin } = useAuth();
  const event = useDocLive<EventItem>('event', () => (id ? doc(db, 'events', id) : null), [id]);
  const going = useLive<Going>('going', () => (id ? collection(db, 'events', id, 'going') : null), [id]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/events'));

  if (event === undefined) return <Screen><BackLink onPress={back} title="Events" /></Screen>;
  if (event === null || !member || !id) {
    return (
      <Screen>
        <BackLink onPress={back} title="Events" />
        <Body>This event isn&apos;t in the diary any more.</Body>
      </Screen>
    );
  }

  const imIn = (going ?? []).some((g) => g.id === member.id);
  const link = event.link ? (/^https?:\/\//i.test(event.link) ? event.link : `https://${event.link}`) : '';

  async function toggle() {
    if (!member || !id) return;
    setBusy(true);
    setError('');
    try {
      const ref = doc(db, 'events', id, 'going', member.id);
      if (imIn) await deleteDoc(ref);
      else await setDoc(ref, { name: member.name, intake: member.intake });
    } catch {
      setError("Couldn't update that. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!id) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, 'events', id));
      back();
    } catch {
      setError("Couldn't remove it just now. Try again.");
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title={imIn ? "You're going. Change your mind?" : "I'm in"} kind={imIn ? 'dark' : 'primary'} onPress={toggle} busy={busy && !confirm} />}>
      <BackLink onPress={back} title="Events" />
      <Label>{[formatDay(event.date), event.time].filter(Boolean).join(' · ')}</Label>
      <View style={{ height: 10 }} />
      <H1 size={36}>{event.title}</H1>
      {event.place ? <Text style={{ fontFamily: F.bold, fontSize: 16, letterSpacing: -0.3, color: C.ink, marginTop: 10 }}>{event.place}</Text> : null}
      <ErrorText>{error}</ErrorText>
      {event.description ? <Body color={C.ink} style={{ marginTop: 18 }}>{event.description}</Body> : null}
      {link ? <Button title="Tickets and detail" kind="ghost" onPress={() => Linking.openURL(link)} style={{ marginTop: 22 }} /> : null}

      <Hairline style={{ marginTop: 26, marginBottom: 20 }} />
      <Label color={C.ink}>{going ? `${going.length} going` : 'Going'}</Label>
      {going && going.length === 0 ? <Body style={{ fontSize: 13, marginTop: 8 }}>Be the first name on the list.</Body> : null}
      {(going ?? []).map((g) => (
        <Pressable key={g.id} onPress={() => router.push(`/member/${g.id}`)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}>
          <Avatar name={g.name} size={40} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 14.5, color: C.ink }}>{g.id === member.id ? 'You' : g.name}</Text>
            <Label style={{ marginTop: 3 }}>{g.intake}</Label>
          </View>
        </Pressable>
      ))}

      {isAdmin ? (
        confirm ? (
          <View style={{ backgroundColor: C.soft, borderRadius: 14, padding: 16, marginTop: 20 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 14.5, color: C.ink }}>Remove this event for everyone?</Text>
            <Button title="Yes, remove it" kind="dark" onPress={remove} busy={busy} style={{ marginTop: 12, height: 48 }} />
            <Button title="Keep it" kind="quiet" onPress={() => setConfirm(false)} />
          </View>
        ) : (
          <Button title="Remove this event" kind="quiet" onPress={() => setConfirm(true)} style={{ marginTop: 16, alignSelf: 'flex-start', paddingHorizontal: 0 }} />
        )
      ) : null}
    </Screen>
  );
}
