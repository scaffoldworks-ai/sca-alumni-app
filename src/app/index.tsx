import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { Body, Button, C, H1, Label, Logo, Screen } from '@/ui';

export default function Welcome() {
  const { loading, user, member } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={C.white} />
      </View>
    );
  }
  if (user && member?.status === 'approved') return <Redirect href="/home" />;
  if (user && member) return <Redirect href="/pending" />;
  if (user) return <Redirect href="/join" />;

  return (
    <Screen
      dark
      scroll={false}
      footer={
        <>
          <Button title="Ask to join" onPress={() => router.push('/join')} />
          <Button title="I already have an account" kind="quiet" onPress={() => router.push('/signin')} style={{ marginTop: 6 }} />
        </>
      }>
      <StatusBar style="light" />
      <Logo size={52} dark />
      <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 28 }}>
        <Label color="#9A9A9A">SCA Alumni</Label>
        <View style={{ height: 14 }} />
        <H1 color={C.white} size={44}>{'Everyone who made it *through.*'}</H1>
        <Body color="#B5B5B5" style={{ marginTop: 18 }}>
          Find each other. Hire each other. Every class, on tap. For School of Communication Arts alumni only.
        </Body>
      </View>
    </Screen>
  );
}
