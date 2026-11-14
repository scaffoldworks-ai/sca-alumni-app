import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, where } from 'firebase/firestore';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { liveJobs, newestFirst, useLive, type Job } from '@/lib/data';
import { db } from '@/lib/firebase';
import { MarcSays } from '@/components/marc-says';
import { Body, Button, C, F, H1, Label, Screen } from '@/ui';

export default function Jobs() {
  const { member } = useAuth();
  const router = useRouter();
  const uid = member?.id;
  const live = useLive<Job>('jobs', liveJobs, []);
  const mine = useLive<Job>('myJobs', () => (uid ? query(collection(db, 'jobs'), where('postedBy', '==', uid)) : null), [uid]);
  const waiting = (mine ?? []).filter((j) => j.status === 'pending' || j.status === 'declined');

  return (
    <Screen>
      <Label>{live ? `${live.length} open ${live.length === 1 ? 'role' : 'roles'}` : 'Jobs'}</Label>
      <View style={{ height: 10 }} />
      <H1>{'Work from people you *trust.*'}</H1>
      <Button title="Post a job" kind="dark" onPress={() => router.push('/job/new')} style={{ marginTop: 22, height: 50 }} />

      {waiting.map((j) => (
        <View key={j.id} style={{ backgroundColor: C.soft, borderRadius: 14, padding: 16, marginTop: 14, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 14.5, color: C.ink }}>{j.title}</Text>
            <Text style={{ fontFamily: F.medium, fontSize: 12.5, color: C.grey, marginTop: 2 }}>
              {j.status === 'pending' ? 'With Marc. It goes live once he has added his line.' : "Marc didn't put this one live. Message him if you want to talk it through."}
            </Text>
          </View>
          <Label color={j.status === 'pending' ? C.ink : C.red}>{j.status === 'pending' ? 'Waiting' : 'Not live'}</Label>
        </View>
      ))}

      <View style={{ height: 12 }} />
      {live && live.length === 0 ? <Body style={{ marginTop: 16 }}>Nothing live yet. Know of a role? Post it and Marc will put his name to it.</Body> : null}
      {newestFirst(live ?? []).map((j) => (
        <Pressable key={j.id} onPress={() => router.push(`/job/${j.id}`)} style={{ paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Label>{[j.kind, j.location].filter(Boolean).join(' · ') || 'Job'}</Label>
              <Text style={{ fontFamily: F.extra, fontSize: 21, letterSpacing: -0.6, color: C.ink, marginTop: 6 }}>{j.title}</Text>
              <Text style={{ fontFamily: F.semi, fontSize: 14, color: C.ink, marginTop: 3 }}>{j.company}</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={C.ink} style={{ marginTop: 22 }} />
          </View>
          {j.marcSays ? <MarcSays text={j.marcSays} /> : null}
        </Pressable>
      ))}
    </Screen>
  );
}
