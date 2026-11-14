import { Redirect, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { View } from 'react-native';

import { friendlyAuthError, useAuth } from '@/lib/auth';
import { auth, db } from '@/lib/firebase';
import { INTAKES } from '@/lib/intakes';
import { BackLink, Body, Button, ErrorText, Field, H1, Label, Pill, Screen } from '@/ui';

export default function Join() {
  const { user, member } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [intake, setIntake] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user && member) return <Redirect href="/" />;

  // Someone can be signed in without a request on file if the second step failed last time.
  const needsAccount = !user;

  async function submit() {
    setError('');
    if (!name.trim()) return setError('Add your name.');
    if (!intake) return setError('Pick your intake.');
    if (needsAccount && !email.trim()) return setError('Add your email.');
    setBusy(true);
    try {
      const current = user ?? (await createUserWithEmailAndPassword(auth, email.trim(), password)).user;
      await setDoc(doc(db, 'members', current.uid), {
        name: name.trim(),
        email: current.email,
        intake,
        note: note.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      if (!current.emailVerified) sendEmailVerification(current).catch(() => {});
      router.replace('/pending');
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title="Send to Marc" onPress={submit} busy={busy} />}>
      <BackLink
        title={needsAccount ? 'Back' : 'Sign out'}
        onPress={() => (needsAccount ? (router.canGoBack() ? router.back() : router.replace('/')) : signOut(auth))}
      />
      <Label>Ask to join</Label>
      <View style={{ height: 12 }} />
      <H1>{'Marc checks *everyone* in.'}</H1>
      <Body style={{ marginTop: 14, marginBottom: 28 }}>Alumni only. Tell us who you are and Marc will approve you himself.</Body>

      <ErrorText>{error}</ErrorText>
      <Field label="Your name" value={name} onChangeText={setName} placeholder="As your classmates knew you" autoCapitalize="words" autoComplete="name" />
      {needsAccount ? (
        <>
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" autoComplete="email" keyboardType="email-address" hint="The one SCA has for you gets you approved fastest." />
          <Field label="Choose a password" value={password} onChangeText={setPassword} placeholder="At least six characters" secureTextEntry autoCapitalize="none" autoComplete="new-password" />
        </>
      ) : null}

      <Label>Your intake</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, marginBottom: 14 }}>
        {INTAKES.map((i) => (
          <Pill key={i.name} title={i.name} active={intake === i.name} onPress={() => setIntake(i.name)} />
        ))}
      </View>

      <Field label="Optional" value={note} onChangeText={setNote} placeholder="Something only a classmate would know" multiline />
    </Screen>
  );
}
