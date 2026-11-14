import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { BackLink, Body, C, F, H1, Label, Screen } from '@/ui';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'Who looks after your details',
    body: 'SCA Alumni is run by Scaffold AI Ltd in partnership with the School of Communication Arts. Scaffold AI Ltd holds the member data and is responsible for it.',
  },
  {
    title: 'What we hold',
    body: 'Your name, email address and intake. Anything you choose to add to your profile: role, where you work, craft, city and a link to your work. Whether you are open to opportunities and who you have chosen to show that to. Jobs you post, events you say you are going to, and messages you send in the app.',
  },
  {
    title: 'Who can see what',
    body: 'Approved alumni can see your name, intake and the profile details you add. Your email address is visible only to you and the Dean. If you set "open to opportunities" to SCA team only, only the Dean sees it. One-to-one messages are visible to the two people in the chat. Intake rooms are visible to members of that intake. People you block are never told.',
  },
  {
    title: 'What we use it for',
    body: 'To check you are an SCA alum, to run the directory, jobs, events, chat and class library, and so the Dean can make introductions and send you news about the community. We do not sell your details or show you advertising.',
  },
  {
    title: 'Where it is kept',
    body: 'In Google Firebase, in a London data centre. Google stores and processes it on our behalf.',
  },
  {
    title: 'How long we keep it',
    body: 'For as long as you have an account. Delete your account from your profile at any time and your profile and sign-in are removed. Messages you sent to other people stay in their conversations.',
  },
  {
    title: 'Your rights',
    body: 'You can ask for a copy of your details, ask us to correct them, or ask us to delete them. Email marc@scaffoldworks.ai. If you are unhappy with how we have handled your details you can complain to the Information Commissioner’s Office at ico.org.uk.',
  },
];

export default function Privacy() {
  const router = useRouter();
  return (
    <Screen>
      <BackLink onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <Label>Privacy</Label>
      <View style={{ height: 10 }} />
      <H1>{'Your details, *plainly.*'}</H1>
      <View style={{ height: 14 }} />
      {SECTIONS.map((s) => (
        <View key={s.title} style={{ marginTop: 22 }}>
          <Text style={{ fontFamily: F.extra, fontSize: 17, letterSpacing: -0.4, color: C.ink }}>{s.title}</Text>
          <Body color={C.ink} style={{ marginTop: 6, fontSize: 14.5, lineHeight: 22 }}>{s.body}</Body>
        </View>
      ))}
    </Screen>
  );
}
