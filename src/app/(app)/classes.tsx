import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { collection } from 'firebase/firestore';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { newestFirst, useLive, type ClassItem } from '@/lib/data';
import { db } from '@/lib/firebase';
import { Body, Button, C, F, H1, Label, Screen } from '@/ui';

const LINE = '#222222';

export default function Classes() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const all = useLive<ClassItem>('classes', () => collection(db, 'classes'), []);
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const shown = newestFirst(all ?? []).filter((c) => !q || [c.title, c.mentor, c.topic].some((v) => v?.toLowerCase().includes(q)));

  function play(c: ClassItem) {
    const url = /^https?:\/\//i.test(c.url) ? c.url : `https://${c.url}`;
    WebBrowser.openBrowserAsync(url).catch(() => {});
  }

  return (
    <Screen dark>
      <StatusBar style="light" />
      <Label color="#9A9A9A">{all ? `${all.length} ${all.length === 1 ? 'class' : 'classes'}` : 'Classes'}</Label>
      <View style={{ height: 10 }} />
      <H1 color={C.white}>{'Every class. *Yours.*'}</H1>

      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 12, height: 50, paddingHorizontal: 14, marginTop: 20 }}>
        <Ionicons name="search" size={18} color="#9A9A9A" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Mentor, subject or title"
          placeholderTextColor="#6F6F6F"
          autoCapitalize="none"
          autoCorrect={false}
          style={{ flex: 1, marginLeft: 10, fontFamily: F.semi, fontSize: 15, color: C.white, height: 50 }}
        />
      </View>
      {isAdmin ? <Button title="Add a class" kind="primary" onPress={() => router.push('/class/new')} style={{ marginTop: 14, height: 50 }} /> : null}

      <View style={{ height: 8 }} />
      {all && all.length === 0 ? <Body color="#B5B5B5" style={{ marginTop: 16 }}>The library is being loaded. The first classes land here soon.</Body> : null}
      {all && all.length > 0 && shown.length === 0 ? <Body color="#B5B5B5" style={{ marginTop: 16 }}>Nothing matches that.</Body> : null}
      {shown.map((c) => (
        <Pressable key={c.id} onPress={() => play(c)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: LINE }}>
          <View style={{ width: 52, height: 52, borderRadius: 13, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="play" size={20} color={C.white} style={{ marginLeft: 2 }} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={{ fontFamily: F.extra, fontSize: 17, letterSpacing: -0.4, color: C.white }}>{c.title}</Text>
            <Label color="#9A9A9A" style={{ marginTop: 5 }}>{[c.mentor, c.topic, c.minutes ? `${c.minutes} min` : ''].filter(Boolean).join(' · ')}</Label>
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}
