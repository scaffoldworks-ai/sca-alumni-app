import { Redirect, useRouter } from 'expo-router';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { friendlyAuthError, useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { BackLink, Button, C, ErrorText, F, Field, H1, Label, Screen } from '@/ui';

export default function SignIn() {
  const { user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Redirect href="/" />;

  async function submit() {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    setError('');
    setNotice('');
    if (!email.trim()) return setError('Type your email above first.');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice('If that email has an account, a reset link is on its way.');
    } catch (e) {
      setError(friendlyAuthError(e));
    }
  }

  return (
    <Screen
      footer={
        <>
          <Button title="Sign in" onPress={submit} busy={busy} />
          <Button title="Forgotten your password?" kind="quiet" onPress={reset} style={{ marginTop: 6 }} />
        </>
      }>
      <BackLink onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <Label>Sign in</Label>
      <View style={{ height: 12 }} />
      <H1>{'Welcome *back.*'}</H1>
      <View style={{ height: 28 }} />
      <ErrorText>{error}</ErrorText>
      {notice ? <Text style={{ fontFamily: F.semi, fontSize: 13, lineHeight: 19, color: C.ink, marginBottom: 14 }}>{notice}</Text> : null}
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" autoComplete="email" keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry autoCapitalize="none" autoComplete="current-password" onSubmitEditing={submit} />
    </Screen>
  );
}
