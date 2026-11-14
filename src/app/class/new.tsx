import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { View } from 'react-native';

import { Gate } from '@/components/gate';
import { db } from '@/lib/firebase';
import { BackLink, Body, Button, ErrorText, Field, H1, Label, Screen } from '@/ui';

export default function NewClassScreen() {
  return (
    <Gate admin>
      <NewClass />
    </Gate>
  );
}

function NewClass() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [mentor, setMentor] = useState('');
  const [topic, setTopic] = useState('');
  const [minutes, setMinutes] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/classes'));

  async function submit() {
    setError('');
    if (!title.trim()) return setError('Give the class a title.');
    if (!url.trim()) return setError('Add the link to the video.');
    setBusy(true);
    try {
      await addDoc(collection(db, 'classes'), { title: title.trim(), mentor: mentor.trim(), topic: topic.trim(), minutes: minutes.trim(), url: url.trim(), createdAt: serverTimestamp() });
      back();
    } catch {
      setError("Couldn't save that. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title="Add to the library" onPress={submit} busy={busy} />}>
      <BackLink onPress={back} title="Classes" />
      <Label>Add a class</Label>
      <View style={{ height: 10 }} />
      <H1>{'One more for the *library.*'}</H1>
      <Body style={{ marginTop: 12, marginBottom: 22 }}>For now a class is a title and a link to the video. Proper in-app playback comes when the files are hosted.</Body>
      <ErrorText>{error}</ErrorText>
      <Field label="Title" value={title} onChangeText={setTitle} placeholder="How to have an idea" />
      <Field label="Mentor" value={mentor} onChangeText={setMentor} placeholder="Who taught it" autoCapitalize="words" />
      <Field label="Subject" value={topic} onChangeText={setTopic} placeholder="Ideas, copy, art direction, strategy" />
      <Field label="Length in minutes" value={minutes} onChangeText={setMinutes} placeholder="45" keyboardType="number-pad" />
      <Field label="Video link" value={url} onChangeText={setUrl} placeholder="https://" autoCapitalize="none" keyboardType="url" />
    </Screen>
  );
}
