import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { INTAKES } from '@/lib/intakes';
import { useApprovedMembers, workLine } from '@/lib/members';
import { Avatar, Body, C, F, H1, Label, Pill, Screen } from '@/ui';

const OPEN = '__open';

export default function People() {
  const router = useRouter();
  const members = useApprovedMembers();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const intakesPresent = useMemo(() => {
    const present = new Set((members ?? []).map((m) => m.intake));
    return INTAKES.filter((i) => present.has(i.name)).reverse();
  }, [members]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (members ?? []).filter((m) => {
      if (filter === OPEN && !m.openPublic) return false;
      if (filter && filter !== OPEN && m.intake !== filter) return false;
      if (!q) return true;
      return [m.name, m.role, m.employer, m.city, m.discipline, m.intake].some((v) => v?.toLowerCase().includes(q));
    });
  }, [members, search, filter]);

  return (
    <Screen scroll={false} padded={false}>
      <View style={{ paddingHorizontal: 24 }}>
        <Label>{members ? `${members.length} alumni` : 'Alumni'}</Label>
        <View style={{ height: 10 }} />
        <H1>{'Find your *people.*'}</H1>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.soft, borderRadius: 12, height: 50, paddingHorizontal: 14, marginTop: 20 }}>
          <Ionicons name="search" size={18} color={C.grey} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Name, agency, city, craft"
            placeholderTextColor={C.mid}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ flex: 1, marginLeft: 10, fontFamily: F.semi, fontSize: 15, color: C.ink, height: 50 }}
          />
        </View>
      </View>
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 14, paddingBottom: 6 }}>
          <Pill title="Everyone" active={filter === ''} onPress={() => setFilter('')} />
          <Pill title="Open to opportunities" dot active={filter === OPEN} onPress={() => setFilter(filter === OPEN ? '' : OPEN)} />
          {intakesPresent.map((i) => (
            <Pill key={i.name} title={i.name} active={filter === i.name} onPress={() => setFilter(filter === i.name ? '' : i.name)} />
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={shown}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: C.line }} />}
        ListEmptyComponent={
          members ? (
            <Body style={{ marginTop: 24 }}>{filter === OPEN ? 'Nobody has said they are open to opportunities yet.' : 'Nobody matches that yet.'}</Body>
          ) : undefined
        }
        renderItem={({ item: m }) => (
          <Pressable onPress={() => router.push(`/member/${m.id}`)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
            <Avatar name={m.name} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontFamily: F.bold, fontSize: 16, letterSpacing: -0.3, color: C.ink }}>{m.name}</Text>
              {workLine(m) ? <Text numberOfLines={1} style={{ fontFamily: F.medium, fontSize: 13, color: C.grey, marginTop: 2 }}>{workLine(m)}</Text> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                {m.openPublic ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C.red, marginRight: 6 }} /> : null}
                <Label>{m.openPublic ? `Open · ${m.intake}` : m.city ? `${m.intake} · ${m.city}` : m.intake}</Label>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.mid} />
          </Pressable>
        )}
      />
    </Screen>
  );
}
