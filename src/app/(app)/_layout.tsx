import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/tab-bar';
import { useAuth } from '@/lib/auth';

export default function AppLayout() {
  const { loading, user, member } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/" />;
  if (!member) return <Redirect href="/join" />;
  if (member.status !== 'approved') return <Redirect href="/pending" />;

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }} backBehavior="history">
      <Tabs.Screen name="home" />
      <Tabs.Screen name="people" />
      <Tabs.Screen name="jobs" />
      <Tabs.Screen name="events" />
      <Tabs.Screen name="classes" />
    </Tabs>
  );
}
