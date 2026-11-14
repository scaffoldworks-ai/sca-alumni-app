import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { initials } from '@/lib/auth';

export const C = {
  ink: '#0A0A0A',
  red: '#E30710',
  grey: '#5C5C5C',
  mid: '#9A9A9A',
  line: '#E8E8E8',
  soft: '#F4F4F4',
  white: '#FFFFFF',
};

export const F = {
  medium: 'Montserrat_500Medium',
  semi: 'Montserrat_600SemiBold',
  bold: 'Montserrat_700Bold',
  extra: 'Montserrat_800ExtraBold',
};

const hand = require('../assets/images/hand.png');

export function Logo({ size = 36, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: dark ? C.white : 'transparent',
        overflow: 'hidden',
      }}>
      <Image source={hand} style={{ width: size, height: size }} contentFit="contain" />
    </View>
  );
}

/** Small uppercase, letter-spaced label. */
export function Label({ children, color = C.grey, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.label, { color }, style]}>{children}</Text>;
}

/** Headline. Wrap one key word in *asterisks* to put the red block behind it. */
export function H1({ children, color = C.ink, size = 34 }: { children: string; color?: string; size?: number }) {
  const parts = children.split('*');
  return (
    <Text style={[s.h1, { color, fontSize: size, lineHeight: size * 1.12, letterSpacing: -size * 0.03 }]}>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={{ backgroundColor: C.red, color: C.white }}>
            {'\u00A0' + p + '\u00A0'}
          </Text>
        ) : (
          p
        ),
      )}
    </Text>
  );
}

export function Body({ children, color = C.grey, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.body, { color }, style]}>{children}</Text>;
}

export function Button({
  title,
  onPress,
  kind = 'primary',
  busy = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress: () => void;
  kind?: 'primary' | 'dark' | 'ghost' | 'quiet';
  busy?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = kind === 'primary' ? C.red : kind === 'dark' ? C.ink : 'transparent';
  const fg = kind === 'ghost' ? C.ink : kind === 'quiet' ? C.grey : C.white;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={busy || disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        kind === 'ghost' && { borderWidth: 1.5, borderColor: C.ink },
        kind === 'quiet' && { height: 44 },
        style,
      ]}>
      {busy ? <ActivityIndicator color={fg} /> : <Text style={[s.buttonText, { color: fg }]}>{title}</Text>}
    </Pressable>
  );
}

export function Field({ label, hint, ...props }: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Label>{label}</Label>
      <TextInput placeholderTextColor={C.mid} {...props} style={[s.input, props.multiline && { height: 84, paddingTop: 12, textAlignVertical: 'top' }, props.style]} />
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Avatar({ name, size = 48, dark = false }: { name?: string; size?: number; dark?: boolean }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.24, backgroundColor: dark ? C.ink : C.soft, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: F.bold, fontSize: size * 0.36, color: dark ? C.white : C.ink, letterSpacing: -0.3 }}>{initials(name)}</Text>
    </View>
  );
}

export function Pill({ title, active = false, onPress, dot = false }: { title: string; active?: boolean; onPress?: () => void; dot?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[s.pill, active && { backgroundColor: C.ink, borderColor: C.ink }]}>
      {dot ? <View style={s.dot} /> : null}
      <Text style={[s.pillText, active && { color: C.white }]}>{title}</Text>
    </Pressable>
  );
}

export function Hairline({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: 1, backgroundColor: C.line }, style]} />;
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <Text style={s.error}>{children}</Text>;
}

export function BackLink({ onPress, title = 'Back', color = C.ink }: { onPress: () => void; title?: string; color?: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' }}>
      <Ionicons name="arrow-back" size={18} color={color} />
      <Text style={{ fontFamily: F.semi, fontSize: 13, color, marginLeft: 6 }}>{title}</Text>
    </Pressable>
  );
}

/** Full-height page with safe-area padding. Content is kept to phone width on the web preview. */
export function Screen({
  children,
  dark = false,
  scroll = true,
  padded = true,
  footer,
}: {
  children: ReactNode;
  dark?: boolean;
  scroll?: boolean;
  padded?: boolean;
  footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const bg = dark ? C.ink : C.white;
  const inner: ViewStyle = { paddingHorizontal: padded ? 24 : 0, paddingTop: insets.top + 18, paddingBottom: 32 };
  return (
    <View style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? '#1A1A1A' : bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[s.frame, { backgroundColor: bg }]}>
        {scroll ? (
          <ScrollView contentContainerStyle={inner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[inner, { flex: 1, paddingBottom: 0 }]}>{children}</View>
        )}
        {footer ? <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16) + 4 }}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </View>
  );
}

export const s = StyleSheet.create({
  frame: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' },
  label: { fontFamily: F.bold, fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase' },
  h1: { fontFamily: F.extra },
  body: { fontFamily: F.medium, fontSize: 15, lineHeight: 23 },
  button: { height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  buttonText: { fontFamily: F.bold, fontSize: 15, letterSpacing: -0.1 },
  input: { marginTop: 8, height: 52, borderRadius: 12, backgroundColor: C.soft, paddingHorizontal: 16, fontFamily: F.semi, fontSize: 15, color: C.ink },
  hint: { fontFamily: F.medium, fontSize: 12, lineHeight: 17, color: C.grey, marginTop: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: C.line, backgroundColor: C.white, marginRight: 8, marginBottom: 8 },
  pillText: { fontFamily: F.semi, fontSize: 13, color: C.ink },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.red, marginRight: 7 },
  error: { fontFamily: F.semi, fontSize: 13, lineHeight: 19, color: C.red, marginBottom: 14 },
});
