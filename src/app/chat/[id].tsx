import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, doc, limit, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gate } from '@/components/gate';
import { useAuth } from '@/lib/auth';
import { useDocLive, useLive, type Dm, type Message } from '@/lib/data';
import { db } from '@/lib/firebase';
import { useBlocked } from '@/lib/safety';
import { C, F, Label } from '@/ui';

export default function ChatScreen() {
  return (
    <Gate>
      <Chat />
    </Gate>
  );
}

function Chat() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = decodeURIComponent(params.id ?? '');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { member } = useAuth();
  const isDm = id.startsWith('dm_');
  const key = isDm ? id.slice(3) : id;
  const base = isDm ? 'dms' : 'rooms';
  const dm = useDocLive<Dm>('dm', () => (isDm ? doc(db, 'dms', key) : null), [id]);
  const messages = useLive<Message>('messages', () => (key ? query(collection(db, base, key, 'messages'), orderBy('createdAt', 'desc'), limit(200)) : null), [id]);
  const [text, setText] = useState('');
  const [failed, setFailed] = useState(false);
  const blocked = useBlocked(member?.id);
  const [flag, setFlag] = useState<Message | null>(null);
  const [flagged, setFlagged] = useState(false);
  const visible = (messages ?? []).filter((m) => !blocked.includes(m.uid));

  if (!member) return null;
  const other = isDm ? (dm?.members ?? []).find((m) => m !== member.id) ?? '' : '';
  const title = isDm ? dm?.names?.[other] ?? 'Chat' : id.replace(/^intake_/, '');

  async function reportFlag() {
    if (!flag || !member) return;
    try {
      await addDoc(collection(db, 'reports'), { by: member.id, byName: member.name, about: flag.uid, aboutName: flag.name, where: isDm ? 'a one-to-one chat' : `the ${title} room`, text: flag.text.slice(0, 500), reason: '', status: 'new', createdAt: serverTimestamp() });
      setFlagged(true);
    } catch {
      setFlag(null);
    }
  }

  async function send() {
    const body = text.trim();
    if (!body || !member) return;
    setText('');
    setFailed(false);
    try {
      await addDoc(collection(db, base, key, 'messages'), { uid: member.id, name: member.name, text: body, createdAt: serverTimestamp() });
      if (isDm) await updateDoc(doc(db, 'dms', key), { lastText: body.slice(0, 140), updatedAt: serverTimestamp() });
    } catch {
      setText(body);
      setFailed(true);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? '#1A1A1A' : C.white }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: C.white }}>
        <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.line }}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/chats'))} hitSlop={12} accessibilityLabel="Back">
            <Ionicons name="arrow-back" size={22} color={C.ink} />
          </Pressable>
          <View style={{ marginLeft: 14, flex: 1 }}>
            <Label>{isDm ? 'One to one' : 'Intake room'}</Label>
            <Text numberOfLines={1} style={{ fontFamily: F.extra, fontSize: 20, letterSpacing: -0.5, color: C.ink, marginTop: 2 }}>{title}</Text>
          </View>
        </View>

        <FlatList
          inverted
          data={visible}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14 }}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            messages ? (
              <View style={{ transform: [{ scaleY: -1 }], paddingVertical: 24 }}>
                <Text style={{ fontFamily: F.medium, fontSize: 14, lineHeight: 21, color: C.grey, textAlign: 'center' }}>{isDm ? 'Say hello.' : `Nobody has spoken yet. Start ${title} off.`}</Text>
              </View>
            ) : undefined
          }
          renderItem={({ item: m, index }) => {
            const own = m.uid === member.id;
            const older = visible[index + 1];
            const showName = !isDm && !own && older?.uid !== m.uid;
            return (
              <View style={{ alignItems: own ? 'flex-end' : 'flex-start', marginTop: showName ? 12 : 4 }}>
                {showName ? <Label style={{ marginBottom: 4, marginLeft: 4 }}>{m.name}</Label> : null}
                <Pressable
                  onLongPress={own ? undefined : () => { setFlag(m); setFlagged(false); }}
                  delayLongPress={350}
                  style={{ maxWidth: '82%', backgroundColor: own ? C.ink : C.soft, borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14 }}>
                  <Text style={{ fontFamily: F.medium, fontSize: 15, lineHeight: 21, color: own ? C.white : C.ink }}>{m.text}</Text>
                </Pressable>
              </View>
            );
          }}
        />

        {flag ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.soft, paddingHorizontal: 20, paddingVertical: 12 }}>
            <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 13, lineHeight: 18, color: C.ink }}>{flagged ? 'Sent to Marc. He’ll look into it.' : `Report ${flag.name.split(' ')[0]}’s message to Marc?`}</Text>
            {flagged ? null : (
              <Pressable onPress={reportFlag} hitSlop={8} style={{ marginLeft: 14 }}>
                <Label color={C.red}>Report</Label>
              </Pressable>
            )}
            <Pressable onPress={() => setFlag(null)} hitSlop={8} style={{ marginLeft: 16 }}>
              <Label>{flagged ? 'Close' : 'Cancel'}</Label>
            </Pressable>
          </View>
        ) : null}
        {failed ? <Text style={{ fontFamily: F.semi, fontSize: 12.5, color: C.red, paddingHorizontal: 20, paddingBottom: 6 }}>That didn&apos;t send. Try again.</Text> : null}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 12), borderTopWidth: 1, borderTopColor: C.line }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message"
            placeholderTextColor={C.mid}
            multiline
            maxLength={2000}
            style={{ flex: 1, minHeight: 46, maxHeight: 120, borderRadius: 23, backgroundColor: C.soft, paddingHorizontal: 18, paddingTop: 13, paddingBottom: 13, fontFamily: F.medium, fontSize: 15, color: C.ink }}
          />
          <Pressable onPress={send} accessibilityLabel="Send" disabled={!text.trim()} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: text.trim() ? C.red : C.line, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }}>
            <Ionicons name="arrow-up" size={22} color={C.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
