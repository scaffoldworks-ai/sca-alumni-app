import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { useApprovedMembers, usePendingMembers, workLine } from '@/lib/members';
import { Avatar, Body, C, F, H1, Hairline, Label, Logo, Screen } from '@/ui';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening';
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: F.extra, fontSize: 30, letterSpacing: -1, color: C.ink }}>{value}</Text>
      <Label style={{ marginTop: 2 }}>{label}</Label>
    </View>
  );
}

const NEXT = [
  { icon: 'briefcase-outline', title: 'Jobs', line: 'Posted by alumni, approved by Marc, with a "Marc says" on each.' },
  { icon: 'chatbubbles-outline', title: 'Chat', line: 'One to one, and a room for every intake.' },
  { icon: 'calendar-outline', title: 'Events', line: 'Reunions, talks and portfolio days.' },
  { icon: 'play-circle-outline', title: 'Classes', line: 'The full class library, for alumni only.' },
] as const;

export default function Home() {
  const { member, isAdmin } = useAuth();
  const router = useRouter();
  const members = useApprovedMembers();
  const pending = usePendingMembers(isAdmin);
  if (!member) return null;

  const first = member.name.split(' ')[0];
  const intakes = new Set((members ?? []).map((m) => m.intake)).size;
  const open = (members ?? []).filter((m) => m.openPublic).length;
  const classmates = (members ?? []).filter((m) => m.intake === member.intake && m.id !== member.id);
  const profileThin = !member.role && !member.employer;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Logo size={34} />
          <Label color={C.ink} style={{ marginLeft: 10 }}>SCA Alumni</Label>
        </View>
        <Pressable onPress={() => router.push('/profile')} accessibilityLabel="Your profile" hitSlop={8}>
          <Avatar name={member.name} size={38} dark />
        </Pressable>
      </View>

      <Label>{member.intake}</Label>
      <View style={{ height: 10 }} />
      <H1 size={38}>{`${greeting()}, *${first}.*`}</H1>

      {isAdmin ? (
        <Pressable onPress={() => router.push('/dean')} style={{ backgroundColor: C.ink, borderRadius: 18, padding: 20, marginTop: 26, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Label color="#9A9A9A">Dean&apos;s desk</Label>
            <Text style={{ fontFamily: F.extra, fontSize: 22, letterSpacing: -0.6, color: C.white, marginTop: 8 }}>
              {pending === null ? 'Checking the queue' : pending.length === 0 ? 'Nobody waiting' : `${pending.length} waiting for you`}
            </Text>
          </View>
          {pending && pending.length > 0 ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.red, marginRight: 12 }} /> : null}
          <Ionicons name="arrow-forward" size={20} color={C.white} />
        </Pressable>
      ) : null}

      {profileThin ? (
        <Pressable onPress={() => router.push('/profile')} style={{ backgroundColor: C.soft, borderRadius: 18, padding: 20, marginTop: 14, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 16, letterSpacing: -0.3, color: C.ink }}>Where are you now?</Text>
            <Body style={{ fontSize: 13, lineHeight: 19, marginTop: 4 }}>Add your role and where you work so classmates can find you.</Body>
          </View>
          <Ionicons name="arrow-forward" size={20} color={C.ink} />
        </Pressable>
      ) : null}

      <View style={{ flexDirection: 'row', marginTop: 34 }}>
        <Stat value={members ? members.length : '–'} label="Alumni in" />
        <Stat value={members ? intakes : '–'} label="Intakes" />
        <Stat value={members ? open : '–'} label="Open to work" />
      </View>

      <Hairline style={{ marginTop: 28, marginBottom: 24 }} />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Label color={C.ink}>{`${member.intake} in the app`}</Label>
        <Pressable onPress={() => router.push('/people')} hitSlop={10}>
          <Label color={C.red}>Everyone</Label>
        </Pressable>
      </View>
      {members && classmates.length === 0 ? (
        <Body style={{ fontSize: 13, lineHeight: 20, marginTop: 8 }}>You&apos;re the first of {member.intake} here. The rest are on their way.</Body>
      ) : null}
      {classmates.slice(0, 4).map((m) => (
        <Pressable key={m.id} onPress={() => router.push(`/member/${m.id}`)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
          <Avatar name={m.name} size={44} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 15, letterSpacing: -0.2, color: C.ink }}>{m.name}</Text>
            {workLine(m) ? <Text numberOfLines={1} style={{ fontFamily: F.medium, fontSize: 13, color: C.grey, marginTop: 2 }}>{workLine(m)}</Text> : null}
          </View>
          {m.openPublic ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.red }} /> : null}
        </Pressable>
      ))}

      <Hairline style={{ marginTop: 20, marginBottom: 24 }} />

      <Label color={C.ink}>Being built next</Label>
      {NEXT.map((n) => (
        <View key={n.title} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
          <View style={{ width: 44, height: 44, borderRadius: 11, backgroundColor: C.soft, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={n.icon} size={20} color={C.ink} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ fontFamily: F.bold, fontSize: 15, letterSpacing: -0.2, color: C.ink }}>{n.title}</Text>
            <Text style={{ fontFamily: F.medium, fontSize: 13, lineHeight: 18, color: C.grey, marginTop: 2 }}>{n.line}</Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}
