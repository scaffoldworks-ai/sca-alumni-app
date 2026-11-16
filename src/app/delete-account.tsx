import { useRouter } from 'expo-router';
import { Linking, View } from 'react-native';

import { BackLink, Body, Button, C, H1, Label, Screen } from '@/ui';

/** Public page explaining how to delete an account. The app stores ask for a web address for this. */
export default function DeleteAccount() {
  const router = useRouter();
  return (
    <Screen>
      <BackLink onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <Label>Your account</Label>
      <View style={{ height: 10 }} />
      <H1>{'Leaving is *easy.*'}</H1>
      <Body color={C.ink} style={{ marginTop: 20 }}>
        In the app: open your profile, scroll to the bottom and tap &ldquo;Delete my account&rdquo;. Your profile, your email address, your sign-in and your open-to-opportunities setting are removed straight away.
      </Body>
      <Body color={C.ink} style={{ marginTop: 14 }}>
        Can&apos;t get into the app? Email marc@scaffoldworks.ai from the address you joined with and we will delete the account for you within 30 days.
      </Body>
      <Body style={{ marginTop: 14 }}>
        Messages you sent to other members stay in their conversations. Jobs you posted and events you said you were going to are removed on request.
      </Body>
      <Button title="Email us" kind="ghost" onPress={() => Linking.openURL('mailto:marc@scaffoldworks.ai?subject=Delete%20my%20SCA%20Alumni%20account')} style={{ marginTop: 24 }} />
      <Button title="How we look after your details" kind="quiet" onPress={() => router.push('/privacy')} />
    </Screen>
  );
}
