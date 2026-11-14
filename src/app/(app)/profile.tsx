import { useRouter } from 'expo-router';
import { deleteUser, signOut } from 'firebase/auth';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';

import { useAuth } from '@/lib/auth';
import { auth, db } from '@/lib/firebase';
import { intakeYears } from '@/lib/intakes';
import { Avatar, BackLink, Body, Button, C, ErrorText, F, Field, H1, Hairline, Label, Screen } from '@/ui';

type Visibility = 'team' | 'all';

function Choice({ title, line, active, onPress }: { title: string; line: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: active ? C.ink : C.line, borderRadius: 14, padding: 16, marginTop: 10 }}>
      <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: active ? C.ink : C.mid, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
        {active ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: C.red }} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: F.bold, fontSize: 14.5, color: C.ink }}>{title}</Text>
        <Text style={{ fontFamily: F.medium, fontSize: 12.5, lineHeight: 18, color: C.grey, marginTop: 2 }}>{line}</Text>
      </View>
    </Pressable>
  );
}

export default function Profile() {
  const { member, user } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState(member?.role ?? '');
  const [employer, setEmployer] = useState(member?.employer ?? '');
  const [discipline, setDiscipline] = useState(member?.discipline ?? '');
  const [city, setCity] = useState(member?.city ?? '');
  const [portfolio, setPortfolio] = useState(member?.portfolio ?? '');
  const [open, setOpen] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>('team');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const uid = member?.id;
  useEffect(() => {
    if (!uid) return;
    getDoc(doc(db, 'opportunity', uid))
      .then((snap) => {
        const d = snap.data();
        if (d) {
          setOpen(!!d.open);
          setVisibility(d.visibility === 'all' ? 'all' : 'team');
        }
      })
      .catch(() => {});
  }, [uid]);

  if (!member || !user) return null;
  const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  async function save() {
    if (!member) return;
    setBusy(true);
    setError('');
    setSaved(false);
    try {
      await updateDoc(doc(db, 'members', member.id), {
        role: role.trim(),
        employer: employer.trim(),
        discipline: discipline.trim(),
        city: city.trim(),
        portfolio: portfolio.trim(),
        openPublic: open && visibility === 'all',
      });
      await setDoc(doc(db, 'opportunity', member.id), {
        open,
        visibility,
        name: member.name,
        intake: member.intake,
        updatedAt: serverTimestamp(),
      });
      setSaved(true);
    } catch {
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function removeAccount() {
    if (!member || !auth.currentUser) return;
    setBusy(true);
    setError('');
    try {
      await deleteDoc(doc(db, 'opportunity', member.id)).catch(() => {});
      await deleteDoc(doc(db, 'members', member.id));
      await deleteUser(auth.currentUser);
    } catch (e) {
      const code = (e as { code?: string })?.code;
      setError(
        code === 'auth/requires-recent-login'
          ? 'Your details are removed. To finish closing the account, sign out, sign back in and delete again.'
          : "Couldn't delete just now. Try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen footer={<Button title={saved ? 'Saved' : 'Save'} kind={saved ? 'dark' : 'primary'} onPress={save} busy={busy} />}>
      <BackLink onPress={back} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={member.name} size={64} dark />
        <View style={{ marginLeft: 16, flex: 1 }}>
          <Label>{`${member.intake} · ${intakeYears(member.intake)}`}</Label>
          <Text style={{ fontFamily: F.extra, fontSize: 24, letterSpacing: -0.7, color: C.ink, marginTop: 4 }}>{member.name}</Text>
        </View>
      </View>

      <View style={{ height: 30 }} />
      <H1 size={28}>{'Where are you *now?*'}</H1>
      <View style={{ height: 20 }} />
      <ErrorText>{error}</ErrorText>
      <Field label="Role" value={role} onChangeText={(v) => { setRole(v); setSaved(false); }} placeholder="Creative Director" autoCapitalize="words" />
      <Field label="Where you work" value={employer} onChangeText={(v) => { setEmployer(v); setSaved(false); }} placeholder="Agency, studio, brand or freelance" autoCapitalize="words" />
      <Field label="Craft" value={discipline} onChangeText={(v) => { setDiscipline(v); setSaved(false); }} placeholder="Art direction, copy, strategy, design" />
      <Field label="Based in" value={city} onChangeText={(v) => { setCity(v); setSaved(false); }} placeholder="London" autoCapitalize="words" />
      <Field label="Your work" value={portfolio} onChangeText={(v) => { setPortfolio(v); setSaved(false); }} placeholder="yoursite.com" autoCapitalize="none" keyboardType="url" />

      <Hairline style={{ marginTop: 10, marginBottom: 24 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text style={{ fontFamily: F.extra, fontSize: 20, letterSpacing: -0.5, color: C.ink }}>Open to opportunities</Text>
          <Body style={{ fontSize: 13, lineHeight: 19, marginTop: 4 }}>Marc makes every introduction himself. Nobody contacts you cold.</Body>
        </View>
        <Switch value={open} onValueChange={(v) => { setOpen(v); setSaved(false); }} trackColor={{ true: C.red, false: C.line }} thumbColor={C.white} />
      </View>

      {open ? (
        <View style={{ marginTop: 14 }}>
          <Label>Who can see this</Label>
          <Choice title="SCA team only" line="Just Marc. Your current employer never finds out." active={visibility === 'team'} onPress={() => { setVisibility('team'); setSaved(false); }} />
          <Choice title="All alumni" line="A red dot on your profile tells every member." active={visibility === 'all'} onPress={() => { setVisibility('all'); setSaved(false); }} />
        </View>
      ) : null}

      <Hairline style={{ marginTop: 28, marginBottom: 20 }} />
      <Label>Account</Label>
      <Text style={{ fontFamily: F.semi, fontSize: 14, color: C.ink, marginTop: 8 }}>{user.email}</Text>
      <Button title="Sign out" kind="ghost" onPress={() => signOut(auth)} style={{ marginTop: 16 }} />
      {confirmDelete ? (
        <View style={{ backgroundColor: C.soft, borderRadius: 14, padding: 16, marginTop: 14 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 14.5, color: C.ink }}>Delete your account?</Text>
          <Body style={{ fontSize: 13, lineHeight: 19, marginTop: 4 }}>Your profile and details are removed for good. This can&apos;t be undone.</Body>
          <Button title="Yes, delete everything" kind="dark" onPress={removeAccount} busy={busy} style={{ marginTop: 14, height: 48 }} />
          <Button title="Keep my account" kind="quiet" onPress={() => setConfirmDelete(false)} />
        </View>
      ) : (
        <Button title="Delete my account" kind="quiet" onPress={() => setConfirmDelete(true)} style={{ marginTop: 4 }} />
      )}
    </Screen>
  );
}
