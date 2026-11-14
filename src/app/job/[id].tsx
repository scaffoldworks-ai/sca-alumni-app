import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Linking, Text, View } from 'react-native';

import { Gate } from '@/components/gate';
import { MarcSays } from '@/components/marc-says';
import { useAuth } from '@/lib/auth';
import { jobRef, useDocLive, type Interest, type Job } from '@/lib/data';
import { db } from '@/lib/firebase';
import { BackLink, Body, Button, C, ErrorText, F, Field, H1, Hairline, Label, Screen } from '@/ui';

export default function JobScreen() {
  return (
    <Gate>
      <JobDetail />
    </Gate>
  );
}

function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { member, isAdmin } = useAuth();
  const job = useDocLive<Job>('job', () => (id ? jobRef(id) : null), [id]);
  const interestId = member && id ? `${id}_${member.id}` : '';
  const mine = useDocLive<Interest>('myInterestDoc', () => (interestId ? doc(db, 'interest', interestId) : null), [interestId]);
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const back = () => (router.canGoBack() ? router.back() : router.replace('/jobs'));

  if (job === undefined) return <Screen><BackLink onPress={back} title="Jobs" /></Screen>;
  if (job === null || !member) {
    return (
      <Screen>
        <BackLink onPress={back} title="Jobs" />
        <Body>This job isn&apos;t available any more.</Body>
      </Screen>
    );
  }

  const own = job.postedBy === member.id;
  const link = job.link ? (/^https?:\/\//i.test(job.link) ? job.link : `https://${job.link}`) : '';

  async function send() {
    if (!job || !member) return;
    setBusy(true);
    setError('');
    try {
      await setDoc(doc(db, 'interest', interestId), {
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        uid: member.id,
        name: member.name,
        intake: member.intake,
        note: note.trim(),
        status: 'new',
        createdAt: serverTimestamp(),
      });
      setAsking(false);
    } catch {
      setError("Couldn't send that. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function close() {
    if (!job) return;
    setBusy(true);
    try {
      await updateDoc(jobRef(job.id), { status: 'closed' });
      back();
    } catch {
      setError("Couldn't close it just now. Try again.");
      setBusy(false);
    }
  }

  const footer =
    job.status !== 'live' ? null : mine ? (
      <View style={{ backgroundColor: C.soft, borderRadius: 14, padding: 16 }}>
        <Text style={{ fontFamily: F.bold, fontSize: 14.5, color: C.ink }}>{mine.status === 'introduced' ? 'Marc has made the introduction.' : 'Marc knows. He’ll make the introduction.'}</Text>
        <Text style={{ fontFamily: F.medium, fontSize: 12.5, lineHeight: 18, color: C.grey, marginTop: 2 }}>
          {mine.status === 'introduced' ? 'Check your email and messages.' : 'Nothing else to do for now.'}
        </Text>
      </View>
    ) : own ? null : asking ? (
      <>
        <ErrorText>{error}</ErrorText>
        <Field label="A line for Marc (optional)" value={note} onChangeText={setNote} placeholder="Why you, why now" multiline />
        <Button title="Ask Marc to introduce me" onPress={send} busy={busy} />
        <Button title="Not now" kind="quiet" onPress={() => setAsking(false)} />
      </>
    ) : (
      <Button title="I'm interested" onPress={() => setAsking(true)} />
    );

  return (
    <Screen footer={footer}>
      <BackLink onPress={back} title="Jobs" />
      <Label>{[job.kind, job.location].filter(Boolean).join(' · ') || 'Job'}</Label>
      <View style={{ height: 10 }} />
      <H1 size={34}>{job.title}</H1>
      <Text style={{ fontFamily: F.bold, fontSize: 17, letterSpacing: -0.3, color: C.ink, marginTop: 10 }}>{job.company}</Text>
      {job.status !== 'live' ? <Label color={C.red} style={{ marginTop: 12 }}>{job.status === 'pending' ? 'Waiting for Marc' : job.status === 'closed' ? 'Closed' : 'Not live'}</Label> : null}
      {job.marcSays ? <MarcSays text={job.marcSays} /> : null}
      <Hairline style={{ marginTop: 24, marginBottom: 20 }} />
      {job.description ? <Body color={C.ink}>{job.description}</Body> : <Body>No more detail yet. Ask Marc.</Body>}
      {link ? <Button title="More detail" kind="ghost" onPress={() => Linking.openURL(link)} style={{ marginTop: 22 }} /> : null}
      <Text style={{ fontFamily: F.medium, fontSize: 12.5, color: C.grey, marginTop: 22 }}>Posted by {own ? 'you' : job.postedByName}</Text>
      {(own || isAdmin) && job.status === 'live' ? (
        <>
          {own ? <ErrorText>{error}</ErrorText> : null}
          <Button title="Role filled? Close it" kind="quiet" onPress={close} busy={busy && !asking} style={{ marginTop: 8, alignSelf: 'flex-start', paddingHorizontal: 0 }} />
        </>
      ) : null}
    </Screen>
  );
}
