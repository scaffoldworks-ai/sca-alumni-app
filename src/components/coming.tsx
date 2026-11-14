import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';

import { Body, C, F, H1, Label, Screen } from '@/ui';

/** Honest placeholder for a section that is designed but not built yet. */
export function Coming({ label, headline, line, points, dark = false }: { label: string; headline: string; line: string; points: string[]; dark?: boolean }) {
  const fg = dark ? C.white : C.ink;
  return (
    <Screen dark={dark}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Label color={dark ? '#9A9A9A' : C.grey}>{label}</Label>
      <View style={{ height: 10 }} />
      <H1 color={fg}>{headline}</H1>
      <Body color={dark ? '#B5B5B5' : C.grey} style={{ marginTop: 14 }}>{line}</Body>
      <View style={{ marginTop: 26, borderTopWidth: 1, borderTopColor: dark ? '#222222' : C.line }}>
        {points.map((p) => (
          <View key={p} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: dark ? '#222222' : C.line }}>
            <Ionicons name="ellipse" size={7} color={C.red} />
            <Text style={{ flex: 1, marginLeft: 14, fontFamily: F.semi, fontSize: 14.5, lineHeight: 21, color: fg }}>{p}</Text>
          </View>
        ))}
      </View>
      <Label color={dark ? '#8A8A8A' : C.mid} style={{ marginTop: 22 }}>Being built next</Label>
    </Screen>
  );
}
