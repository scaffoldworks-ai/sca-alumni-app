import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { View } from 'react-native';

import { Gate } from '@/components/gate';
import { db } from '@/lib/firebase';
import { INTAKES } from '@/lib/intakes';
import { BackLink, Body, Button, ErrorText, Field, H1, Label, Pill, Screen } from '@/ui';

type Audience = 'all' | 'intake' | 'open' | 'person';

export default function AnnounceScreen() {
  return (
    <Gate admin>
      <Announce />
    </Gate>
  );
}

function Announce() {
  const router = useRouter();
  const params = useLocalSearchParams<{ to?: string; name?: string }>();
  const person = params.to ? { uid: params.to, name: params.name ?? 'this member' } : null;
  const [audience, setAudience] = useState<Audience>(person ? 'person' : 'all');
  const [intake, setIntake] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/dean'));
  const who = audience === 'all' ? 'every member' : audience === 'intake' ? (intake ? `everyone in ${intake}` : 'one intake') : audience === 'open' ? 'everyone open to opportunities' : person?.name ?? '';

  async function send() {
    setError('');
    if (!body.trim()) return setError('Write your message first.');
    if (audience === 'intake' && !intake) return setError('Pick the intake.');
    setBusy(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        body: body.trim(),
        audience,
        intake: audience === 'intake' ? intake : '',
        uid: audience === 'person' ? person?.uid ?? '' : '',
        toName: audience === 'person' ? person?.name ?? '' : '',
        createdAt: serverTimestamp(),
      });
      back();
    } catch {
      setError("Couldn't send that. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title={`Send to ${who}`} onPress={send} busy={busy} />}>
      <BackLink onPress={back} />
      <Label>From Marc</Label>
      <View style={{ height: 10 }} />
      <H1>{'Say it *once.*'}</H1>
      <Body style={{ marginTop: 12, marginBottom: 22 }}>It appears at the top of Home for the people you choose.</Body>
      <ErrorText>{error}</ErrorText>

      {person ? (
        <Label color="#0A0A0A" style={{ marginBottom: 18 }}>{`To ${person.name}, and only them`}</Label>
      ) : (
        <>
          <Label>Who is it for</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginBottom: 10 }}>
            <Pill title="Everyone" active={audience === 'all'} onPress={() => setAudience('all')} />
            <Pill title="One intake" active={audience === 'intake'} onPress={() => setAudience('intake')} />
            <Pill title="Open to opportunities" dot active={audience === 'open'} onPress={() => setAudience('open')} />
          </View>
          {audience === 'intake' ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
              {INTAKES.map((i) => (
                <Pill key={i.name} title={i.name} active={intake === i.name} onPress={() => setIntake(i.name)} />
              ))}
            </View>
          ) : null}
        </>
      )}

      <Field label="Your message" value={body} onChangeText={setBody} placeholder="Short and in your voice" multiline style={{ height: 150 }} />
    </Screen>
  );
}
