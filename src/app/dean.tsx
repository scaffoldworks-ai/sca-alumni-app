import { useRouter } from 'expo-router';
import { collection, doc, query, updateDoc, where } from 'firebase/firestore';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Gate } from '@/components/gate';
import type { Member } from '@/lib/auth';
import { newestFirst, useDocLive, useLive, type Interest, type Job } from '@/lib/data';
import { db } from '@/lib/firebase';
import { intakeYears } from '@/lib/intakes';
import { usePendingMembers } from '@/lib/members';
import { Avatar, BackLink, Body, Button, C, ErrorText, F, Field, H1, Label, Pill, Screen } from '@/ui';

type OpenRow = { id: string; name: string; intake: string; visibility: 'team' | 'all' };
type Tab = 'queue' | 'jobs' | 'intros' | 'open' | 'reports';
type Report = { id: string; byName: string; about: string; aboutName: string; where: string; text?: string; reason?: string; createdAt?: { seconds: number } | null };

const card = { borderWidth: 1, borderColor: C.line, borderRadius: 18, padding: 18, marginBottom: 14 } as const;

function Request({ m, onError }: { m: Member; onError: (msg: string) => void }) {
  const [busy, setBusy] = useState<'' | 'approved' | 'declined'>('');
  const contact = useDocLive<{ email?: string }>('contact', () => doc(db, 'contact', m.id), [m.id]);
  const email = contact?.email ?? m.email;
  const check = useDocLive<{ known?: boolean; onList?: boolean; acIntake?: string }>('check', () => doc(db, 'checks', m.id), [m.id]);
  async function decide(status: 'approved' | 'declined') {
    setBusy(status);
    onError('');
    try {
      await updateDoc(doc(db, 'members', m.id), { status });
    } catch {
      onError(`Couldn't update ${m.name}. Try again.`);
      setBusy('');
    }
  }
  return (
    <View style={card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={m.name} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 17, letterSpacing: -0.3, color: C.ink }}>{m.name}</Text>
          <Label style={{ marginTop: 4 }}>{`${m.intake} · ${intakeYears(m.intake)}`}</Label>
        </View>
      </View>
      {email ? <Text selectable style={{ fontFamily: F.semi, fontSize: 13.5, color: C.ink, marginTop: 14 }}>{email}</Text> : null}
      {check ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: check.onList ? C.ink : C.red, marginRight: 8 }} />
          <Text style={{ flex: 1, fontFamily: F.semi, fontSize: 13, lineHeight: 18, color: C.ink }}>
            {check.onList
              ? `On SCA's alumni list${check.acIntake ? ` as ${check.acIntake}` : ''}`
              : check.known
                ? 'In ActiveCampaign, but not on the alumni list'
                : "This email isn't in ActiveCampaign"}
          </Text>
        </View>
      ) : null}
      {m.note ? (
        <View style={{ backgroundColor: C.soft, borderRadius: 12, padding: 14, marginTop: 12 }}>
          <Label>They said</Label>
          <Text style={{ fontFamily: F.medium, fontSize: 14, lineHeight: 21, color: C.ink, marginTop: 6 }}>{m.note}</Text>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', marginTop: 16 }}>
        <Button title="Approve" onPress={() => decide('approved')} busy={busy === 'approved'} disabled={busy === 'declined'} style={{ flex: 1, height: 50, marginRight: 10 }} />
        <Button title="Decline" kind="ghost" onPress={() => decide('declined')} busy={busy === 'declined'} disabled={busy === 'approved'} style={{ flex: 1, height: 50 }} />
      </View>
    </View>
  );
}

function JobRequest({ job, onError }: { job: Job; onError: (msg: string) => void }) {
  const [says, setSays] = useState(job.marcSays ?? '');
  const [busy, setBusy] = useState<'' | 'live' | 'declined'>('');
  async function decide(status: 'live' | 'declined') {
    onError('');
    if (status === 'live' && !says.trim()) return onError('Add your "Marc says" line before it goes live.');
    setBusy(status);
    try {
      await updateDoc(doc(db, 'jobs', job.id), { status, marcSays: says.trim() });
    } catch {
      onError(`Couldn't update "${job.title}". Try again.`);
      setBusy('');
    }
  }
  return (
    <View style={card}>
      <Label>{[job.kind, job.location].filter(Boolean).join(' · ') || 'Job'}</Label>
      <Text style={{ fontFamily: F.extra, fontSize: 20, letterSpacing: -0.5, color: C.ink, marginTop: 6 }}>{job.title}</Text>
      <Text style={{ fontFamily: F.semi, fontSize: 14, color: C.ink, marginTop: 3 }}>{job.company}</Text>
      <Text style={{ fontFamily: F.medium, fontSize: 12.5, color: C.grey, marginTop: 6 }}>Posted by {job.postedByName}</Text>
      {job.description ? <Text style={{ fontFamily: F.medium, fontSize: 14, lineHeight: 21, color: C.ink, marginTop: 12 }}>{job.description}</Text> : null}
      {job.link ? <Text selectable style={{ fontFamily: F.semi, fontSize: 13, color: C.grey, marginTop: 8 }}>{job.link}</Text> : null}
      <View style={{ height: 16 }} />
      <Field label="Marc says" value={says} onChangeText={setSays} placeholder="One line in your voice. Why should they care?" multiline />
      <View style={{ flexDirection: 'row' }}>
        <Button title="Make it live" onPress={() => decide('live')} busy={busy === 'live'} disabled={busy === 'declined'} style={{ flex: 1, height: 50, marginRight: 10 }} />
        <Button title="Decline" kind="ghost" onPress={() => decide('declined')} busy={busy === 'declined'} disabled={busy === 'live'} style={{ flex: 1, height: 50 }} />
      </View>
    </View>
  );
}

function Intro({ i, onError }: { i: Interest; onError: (msg: string) => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function done() {
    setBusy(true);
    onError('');
    try {
      await updateDoc(doc(db, 'interest', i.id), { status: 'introduced' });
    } catch {
      onError("Couldn't update that introduction. Try again.");
      setBusy(false);
    }
  }
  return (
    <View style={card}>
      <Pressable onPress={() => router.push(`/member/${i.uid}`)} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Avatar name={i.name} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ fontFamily: F.bold, fontSize: 17, letterSpacing: -0.3, color: C.ink }}>{i.name}</Text>
          <Label style={{ marginTop: 4 }}>{i.intake}</Label>
        </View>
      </Pressable>
      <Pressable onPress={() => router.push(`/job/${i.jobId}`)} style={{ backgroundColor: C.soft, borderRadius: 12, padding: 14, marginTop: 14 }}>
        <Label>Wants an introduction for</Label>
        <Text style={{ fontFamily: F.bold, fontSize: 15, color: C.ink, marginTop: 6 }}>{i.jobTitle}</Text>
        <Text style={{ fontFamily: F.medium, fontSize: 13, color: C.grey, marginTop: 2 }}>{i.company}</Text>
      </Pressable>
      {i.note ? <Text style={{ fontFamily: F.medium, fontSize: 14, lineHeight: 21, color: C.ink, marginTop: 12 }}>&ldquo;{i.note}&rdquo;</Text> : null}
      <Button title="I've introduced them" kind="dark" onPress={done} busy={busy} style={{ height: 50, marginTop: 16 }} />
    </View>
  );
}

function ReportCard({ r, onError }: { r: Report; onError: (msg: string) => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function done() {
    setBusy(true);
    onError('');
    try {
      await updateDoc(doc(db, 'reports', r.id), { status: 'done' });
    } catch {
      onError("Couldn't update that report. Try again.");
      setBusy(false);
    }
  }
  return (
    <View style={card}>
      <Label color={C.red}>{`Reported by ${r.byName}`}</Label>
      <Pressable onPress={() => router.push(`/member/${r.about}`)}>
        <Text style={{ fontFamily: F.bold, fontSize: 17, letterSpacing: -0.3, color: C.ink, marginTop: 8 }}>{r.aboutName}</Text>
        <Text style={{ fontFamily: F.medium, fontSize: 12.5, color: C.grey, marginTop: 2 }}>{r.where === 'profile' ? 'From their profile' : `In ${r.where}`}</Text>
      </Pressable>
      {r.text ? (
        <View style={{ backgroundColor: C.soft, borderRadius: 12, padding: 14, marginTop: 12 }}>
          <Label>The message</Label>
          <Text style={{ fontFamily: F.medium, fontSize: 14, lineHeight: 21, color: C.ink, marginTop: 6 }}>{r.text}</Text>
        </View>
      ) : null}
      {r.reason ? <Text style={{ fontFamily: F.medium, fontSize: 14, lineHeight: 21, color: C.ink, marginTop: 12 }}>&ldquo;{r.reason}&rdquo;</Text> : null}
      <Button title="Dealt with" kind="dark" onPress={done} busy={busy} style={{ height: 50, marginTop: 16 }} />
    </View>
  );
}

export default function DeanScreen() {
  return (
    <Gate admin>
      <Dean />
    </Gate>
  );
}

function Dean() {
  const router = useRouter();
  const pending = usePendingMembers(true);
  const jobs = useLive<Job>('pendingJobs', () => query(collection(db, 'jobs'), where('status', '==', 'pending')), []);
  const intros = useLive<Interest>('newInterest', () => query(collection(db, 'interest'), where('status', '==', 'new')), []);
  const openRows = useLive<OpenRow>('open', () => query(collection(db, 'opportunity'), where('open', '==', true)), []);
  const reports = useLive<Report>('reports', () => query(collection(db, 'reports'), where('status', '==', 'new')), []);
  const open = openRows ? [...openRows].sort((a, b) => a.name.localeCompare(b.name)) : null;
  const [tab, setTab] = useState<Tab>('queue');
  const [error, setError] = useState('');

  const n = (list: unknown[] | null) => (list && list.length ? ` · ${list.length}` : '');
  const pick = (t: Tab) => {
    setTab(t);
    setError('');
  };
  const headline = { queue: 'Who gets *in.*', jobs: 'What goes *live.*', intros: 'Who meets *whom.*', open: 'Who is *looking.*', reports: 'What needs a *word.*' }[tab];

  return (
    <Screen>
      <BackLink onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))} />
      <Label>Dean&apos;s desk</Label>
      <View style={{ height: 10 }} />
      <H1>{headline}</H1>
      <Button title="Send a message to members" kind="dark" onPress={() => router.push('/announce')} style={{ marginTop: 20, height: 50 }} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, marginTop: 16, marginBottom: 8 }} contentContainerStyle={{ paddingHorizontal: 24 }}>
        <Pill title={`People${n(pending)}`} active={tab === 'queue'} onPress={() => pick('queue')} />
        <Pill title={`Jobs${n(jobs)}`} active={tab === 'jobs'} onPress={() => pick('jobs')} />
        <Pill title={`Introductions${n(intros)}`} active={tab === 'intros'} onPress={() => pick('intros')} />
        <Pill title={`Open to work${n(open)}`} active={tab === 'open'} onPress={() => pick('open')} />
        <Pill title={`Reports${n(reports)}`} active={tab === 'reports'} onPress={() => pick('reports')} />
      </ScrollView>
      <ErrorText>{error}</ErrorText>

      {tab === 'queue' ? (
        <>
          {pending && pending.length === 0 ? <Body>Nobody waiting. New requests land here the moment they&apos;re sent.</Body> : null}
          {(pending ?? []).map((m) => (
            <Request key={m.id} m={m} onError={setError} />
          ))}
        </>
      ) : null}

      {tab === 'jobs' ? (
        <>
          {jobs && jobs.length === 0 ? <Body>No jobs waiting. When an alum posts one, it stops here for your line first.</Body> : null}
          {newestFirst(jobs ?? []).map((j) => (
            <JobRequest key={j.id} job={j} onError={setError} />
          ))}
          <Button title="Post a job yourself" kind="ghost" onPress={() => router.push('/job/new')} style={{ marginTop: 6 }} />
        </>
      ) : null}

      {tab === 'intros' ? (
        <>
          {intros && intros.length === 0 ? <Body>No introductions to make. When someone taps &ldquo;I&apos;m interested&rdquo; on a job, they show up here.</Body> : null}
          {newestFirst(intros ?? []).map((i) => (
            <Intro key={i.id} i={i} onError={setError} />
          ))}
        </>
      ) : null}

      {tab === 'open' ? (
        <>
          {open && open.length === 0 ? <Body>Nobody has switched this on yet.</Body> : null}
          {(open ?? []).map((r) => (
            <Pressable key={r.id} onPress={() => router.push(`/member/${r.id}`)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: C.line }}>
              <Avatar name={r.name} size={44} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={{ fontFamily: F.bold, fontSize: 15.5, letterSpacing: -0.2, color: C.ink }}>{r.name}</Text>
                <Label style={{ marginTop: 4 }}>{r.intake}</Label>
              </View>
              <Label color={r.visibility === 'all' ? C.ink : C.red}>{r.visibility === 'all' ? 'All alumni' : 'Only you'}</Label>
            </Pressable>
          ))}
        </>
      ) : null}

      {tab === 'reports' ? (
        <>
          {reports && reports.length === 0 ? <Body>Nothing reported. If a member flags a person or a message, it comes straight here.</Body> : null}
          {newestFirst(reports ?? []).map((r) => (
            <ReportCard key={r.id} r={r} onError={setError} />
          ))}
        </>
      ) : null}
    </Screen>
  );
}
