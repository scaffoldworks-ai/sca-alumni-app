import { Text, View } from 'react-native';

import { C, F, Label } from '@/ui';

export function MarcSays({ text }: { text: string }) {
  return (
    <View style={{ borderLeftWidth: 3, borderLeftColor: C.red, paddingLeft: 12, marginTop: 14 }}>
      <Label color={C.red}>Marc says</Label>
      <Text style={{ fontFamily: F.semi, fontSize: 14.5, lineHeight: 21, color: C.ink, marginTop: 5 }}>{text}</Text>
    </View>
  );
}
