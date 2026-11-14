import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C, F } from '@/ui';

type IconName = keyof typeof Ionicons.glyphMap;

const TABS: Record<string, { label: string; icon: IconName; iconOn: IconName }> = {
  home: { label: 'Home', icon: 'home-outline', iconOn: 'home' },
  people: { label: 'People', icon: 'people-outline', iconOn: 'people' },
  jobs: { label: 'Jobs', icon: 'briefcase-outline', iconOn: 'briefcase' },
  events: { label: 'Events', icon: 'calendar-outline', iconOn: 'calendar' },
  classes: { label: 'Classes', icon: 'play-circle-outline', iconOn: 'play-circle' },
};

export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index]?.name;
  const dark = current === 'classes';
  const bg = dark ? C.ink : C.white;
  const on = dark ? C.white : C.ink;
  const off = dark ? '#8A8A8A' : C.mid;

  return (
    <View style={{ backgroundColor: Platform.OS === 'web' ? '#1A1A1A' : bg }}>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          maxWidth: 480,
          alignSelf: 'center',
          backgroundColor: bg,
          borderTopWidth: 1,
          borderTopColor: dark ? '#222222' : C.line,
          paddingBottom: Math.max(insets.bottom, 10),
        }}>
        {state.routes.map((route, index) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === index;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
              onPress={() => {
                if (!focused) navigateToTab(route.key);
              }}
              style={{ flex: 1, alignItems: 'center' }}>
              <View style={{ height: 3, width: 28, backgroundColor: focused ? C.red : 'transparent', marginBottom: 9 }} />
              <Ionicons name={focused ? tab.iconOn : tab.icon} size={22} color={focused ? on : off} />
              <Text style={{ fontFamily: focused ? F.bold : F.semi, fontSize: 10, letterSpacing: 0.2, marginTop: 4, color: focused ? on : off }}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
