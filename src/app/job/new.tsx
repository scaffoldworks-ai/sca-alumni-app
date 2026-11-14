import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { View } from 'react-native';

import { Gate } from '@/components/gate';
import { useAuth } from '@/lib/auth';
import { KINDS } from '@/lib/data';
import { db } from '@/lib/firebase';
import { BackLink, Body, Button, ErrorText, Field, H1, Label, Pill, Screen } from '@/ui';

export default function NewJobScreen() {
  return (
    <Gate>
      <NewJob />
    </Gate>
  );
}

function NewJob() {
  const { member, isAdmin } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [kind, setKind] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [says, setSays] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/jobs'));

  async function submit() {
    if (!member) return;
    setError('');
    if (!title.trim()) return setError('Add the job title.');
    if (!company.trim()) return setError('Add who is hiring.');
    if (isAdmin && !says.trim()) return setError('Add your "Marc says" line.');
    setBusy(true);
    try {
      await addDoc(collection(db, 'jobs'), {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        kind,
        description: description.trim(),
        link: link.trim(),
        postedBy: member.id,
        postedByName: member.name,
        status: isAdmin ? 'live' : 'pending',
        marcSays: isAdmin ? says.trim() : '',
        createdAt: serverTimestamp(),
      });
      back();
    } catch {
      setError("Couldn't send that. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title={isAdmin ? 'Put it live' : 'Send to Marc'} onPress={submit} busy={busy} />}>
      <BackLink onPress={back} title="Jobs" />
      <Label>Post a job</Label>
      <View style={{ height: 10 }} />
      <H1>{'Who do you *need?*'}</H1>
      <Body style={{ marginTop: 12, marginBottom: 24 }}>
        {isAdmin ? 'Yours go live straight away.' : 'Marc reads every job and adds his own line before alumni see it.'}
      </Body>
      <ErrorText>{error}</ErrorText>
      <Field label="Job title" value={title} onChangeText={setTitle} placeholder="Senior Art Director" autoCapitalize="words" />
      <Field label="Who is hiring" value={company} onChangeText={setCompany} placeholder="Agency, studio or brand" autoCapitalize="words" />
      <Field label="Where" value={location} onChangeText={setLocation} placeholder="London, hybrid" />
      <Label>Type</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginBottom: 12 }}>
        {KINDS.map((k) => (
          <Pill key={k} title={k} active={kind === k} onPress={() => setKind(kind === k ? '' : k)} />
        ))}
      </View>
      <Field label="The details" value={description} onChangeText={setDescription} placeholder="What the work is, who they'd work with, the money if you can share it" multiline style={{ height: 130 }} />
      <Field label="Link (optional)" value={link} onChangeText={setLink} placeholder="A page with more detail" autoCapitalize="none" keyboardType="url" />
      {isAdmin ? <Field label="Marc says" value={says} onChangeText={setSays} placeholder="One line in your voice. Why should they care?" multiline /> : null}
    </Screen>
  );
}
