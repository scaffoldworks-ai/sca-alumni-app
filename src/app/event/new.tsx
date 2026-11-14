import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { View } from 'react-native';

import { Gate } from '@/components/gate';
import { parseUkDate } from '@/lib/data';
import { db } from '@/lib/firebase';
import { BackLink, Button, ErrorText, Field, H1, Label, Screen } from '@/ui';

export default function NewEventScreen() {
  return (
    <Gate admin>
      <NewEvent />
    </Gate>
  );
}

function NewEvent() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/events'));

  async function submit() {
    setError('');
    if (!title.trim()) return setError('Give the event a name.');
    const iso = parseUkDate(date);
    if (!iso) return setError('Write the date like 12/12/2026.');
    setBusy(true);
    try {
      await addDoc(collection(db, 'events'), { title: title.trim(), date: iso, time: time.trim(), place: place.trim(), description: description.trim(), link: link.trim(), createdAt: serverTimestamp() });
      back();
    } catch {
      setError("Couldn't save that. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title="Add to the diary" onPress={submit} busy={busy} />}>
      <BackLink onPress={back} title="Events" />
      <Label>Add an event</Label>
      <View style={{ height: 10 }} />
      <H1>{"What's *on?*"}</H1>
      <View style={{ height: 24 }} />
      <ErrorText>{error}</ErrorText>
      <Field label="Name" value={title} onChangeText={setTitle} placeholder="Winter reunion" />
      <Field label="Date" value={date} onChangeText={setDate} placeholder="12/12/2026" keyboardType="numbers-and-punctuation" />
      <Field label="Time" value={time} onChangeText={setTime} placeholder="6.30pm" />
      <Field label="Where" value={place} onChangeText={setPlace} placeholder="Venue and area" />
      <Field label="The details" value={description} onChangeText={setDescription} placeholder="What's happening and why come" multiline style={{ height: 120 }} />
      <Field label="Link (optional)" value={link} onChangeText={setLink} placeholder="Tickets or more detail" autoCapitalize="none" keyboardType="url" />
    </Screen>
  );
}
