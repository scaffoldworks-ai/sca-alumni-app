import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection } from 'firebase/firestore';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { today, useLive, type EventItem } from '@/lib/data';
import { db } from '@/lib/firebase';
import { Body, Button, C, F, H1, Label, Screen } from '@/ui';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function Events() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const all = useLive<EventItem>('events', () => collection(db, 'events'), []);
  const now = today();
  const upcoming = (all ?? []).filter((e) => e.date >= now).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <Screen>
      <Label>{all ? `${upcoming.length} coming up` : 'Events'}</Label>
      <View style={{ height: 10 }} />
      <H1>{'See you *there.*'}</H1>
      {isAdmin ? <Button title="Add an event" kind="dark" onPress={() => router.push('/event/new')} style={{ marginTop: 22, height: 50 }} /> : null}
      <View style={{ height: 10 }} />
      {all && upcoming.length === 0 ? <Body style={{ marginTop: 16 }}>Nothing in the diary yet. Reunions, talks and portfolio days will show up here.</Body> : null}
      {upcoming.map((e) => {
        const [, m, d] = e.date.split('-').map(Number);
        return (
          <Pressable key={e.id} onPress={() => router.push(`/event/${e.id}`)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <View style={{ width: 58, height: 64, borderRadius: 14, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: F.extra, fontSize: 22, letterSpacing: -0.6, color: C.white }}>{d}</Text>
              <Text style={{ fontFamily: F.bold, fontSize: 10, letterSpacing: 1.4, color: C.white, marginTop: 1 }}>{MONTHS[m - 1]}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontFamily: F.extra, fontSize: 18, letterSpacing: -0.5, color: C.ink }}>{e.title}</Text>
              <Text numberOfLines={1} style={{ fontFamily: F.medium, fontSize: 13, color: C.grey, marginTop: 4 }}>{[e.time, e.place].filter(Boolean).join(' · ')}</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={C.ink} />
          </Pressable>
        );
      })}
    </Screen>
  );
}
