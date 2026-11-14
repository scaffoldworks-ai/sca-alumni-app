import { Redirect } from 'expo-router';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { Body, Button, C, F, H1, Label, Logo, Screen } from '@/ui';

export default function Pending() {
  const { loading, user, member, isAdminEmail, isAdmin, refreshUser } = useAuth();
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (!user) return <Redirect href="/" />;
  if (!member) return <Redirect href="/join" />;
  if (member.status === 'approved') return <Redirect href="/home" />;

  const declined = member.status === 'declined';
  const mustConfirm = isAdminEmail && !isAdmin;

  async function check() {
    setBusy(true);
    setNotice('');
    try {
      await refreshUser();
      if (!auth.currentUser?.emailVerified) setNotice('Not confirmed yet. Tap the link in the email, then try again.');
    } catch {
      setNotice("Couldn't check just now. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setNotice('');
    try {
      if (auth.currentUser) await sendEmailVerification(auth.currentUser);
      setNotice('Sent. Check your inbox and junk folder.');
    } catch {
      setNotice('Wait a minute before asking for another email.');
    }
  }

  const headline = mustConfirm ? 'Confirm your *email.*' : declined ? "We couldn't *place* you." : "You're in the *queue.*";
  const copy = mustConfirm
    ? `We've sent a link to ${user.email}. Tap it, then come back here. It proves you're the Dean before the app hands over the keys.`
    : declined
      ? 'Marc could not match you to an intake. If that is a mistake, email marc@scaffoldworks.ai and he will sort it.'
      : `Thanks, ${member.name.split(' ')[0]}. Marc approves every member himself, so this can take a day or two. You'll get straight in once he has.`;

  return (
    <Screen
      dark
      scroll={false}
      footer={
        <>
          {mustConfirm ? (
            <>
              <Button title="I've confirmed it" onPress={check} busy={busy} />
              <Button title="Send the email again" kind="quiet" onPress={resend} style={{ marginTop: 6 }} />
            </>
          ) : null}
          <Button title="Sign out" kind="quiet" onPress={() => signOut(auth)} />
        </>
      }>
      <StatusBar style="light" />
      <Logo size={52} dark />
      <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 24 }}>
        <Label color="#9A9A9A">{mustConfirm ? 'One step left' : declined ? 'Request declined' : `${member.intake} · request sent`}</Label>
        <View style={{ height: 14 }} />
        <H1 color={C.white} size={40}>{headline}</H1>
        <Body color="#B5B5B5" style={{ marginTop: 18 }}>{copy}</Body>
        {notice ? <Text style={{ fontFamily: F.semi, fontSize: 13, lineHeight: 19, color: C.white, marginTop: 16 }}>{notice}</Text> : null}
      </View>
    </Screen>
  );
}
