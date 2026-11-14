import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, where } from 'firebase/firestore';
import { Pressable, Text, View } from 'react-native';

import { Gate } from '@/components/gate';
import { useAuth } from '@/lib/auth';
import { useLive, type Dm } from '@/lib/data';
import { db } from '@/lib/firebase';
import { useBlocked } from '@/lib/safety';
import { Avatar, BackLink, Body, Button, C, F, H1, Label, Screen } from '@/ui';

export default function ChatsScreen() {
  return (
    <Gate>
      <Chats />
    </Gate>
  );
}

function Chats() {
  const { member } = useAuth();
  const router = useRouter();
  const uid = member?.id;
  const dms = useLive<Dm>('dms', () => (uid ? query(collection(db, 'dms'), where('members', 'array-contains', uid)) : null), [uid]);
  const blocked = useBlocked(uid);
  if (!member) return null;
  const sorted = [...(dms ?? [])].filter((d) => d.lastText && !d.members.some((m) => blocked.includes(m))).sort((a, b) => (b.updatedAt?.seconds ?? 0) - (a.updatedAt?.seconds ?? 0));

  return (
    <Screen>
      <BackLink onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
      <Label>Chat</Label>
      <View style={{ height: 10 }} />
      <H1>{'Pick up where you *left off.*'}</H1>

      <Pressable onPress={() => router.push(`/chat/intake_${encodeURIComponent(member.intake)}`)} style={{ backgroundColor: C.ink, borderRadius: 18, padding: 18, marginTop: 24, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Label color="#9A9A9A">Your intake</Label>
          <Text style={{ fontFamily: F.extra, fontSize: 22, letterSpacing: -0.6, color: C.white, marginTop: 6 }}>{member.intake}</Text>
          <Text style={{ fontFamily: F.medium, fontSize: 13, color: '#B5B5B5', marginTop: 3 }}>The room for everyone in your year.</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={C.white} />
      </Pressable>

      <Label color={C.ink} style={{ marginTop: 30, marginBottom: 4 }}>One to one</Label>
      {dms && sorted.length === 0 ? (
        <>
          <Body style={{ fontSize: 13.5, lineHeight: 20, marginTop: 8 }}>No conversations yet. Find someone in People and tap Message.</Body>
          <Button title="Find someone" kind="ghost" onPress={() => router.replace('/people')} style={{ marginTop: 16, height: 50 }} />
        </>
      ) : null}
      {sorted.map((d) => {
        const other = d.members.find((m) => m !== member.id) ?? '';
        const name = d.names?.[other] ?? 'Alum';
        return (
          <Pressable key={d.id} onPress={() => router.push(`/chat/dm_${d.id}`)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Avatar name={name} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontFamily: F.bold, fontSize: 16, letterSpacing: -0.3, color: C.ink }}>{name}</Text>
              <Text numberOfLines={1} style={{ fontFamily: F.medium, fontSize: 13, color: C.grey, marginTop: 3 }}>{d.lastText}</Text>
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}
