/**
 * Design-check mode. Built with EXPO_PUBLIC_MOCK=1 the app skips sign-in and shows
 * made-up sample data, so screens can be reviewed without touching the real database.
 * It is never switched on in the builds people use.
 */
export const MOCK = process.env.EXPO_PUBLIC_MOCK === '1';

const s = (n: number) => ({ seconds: 1794650000 - n * 3600 });

export const MOCK_MEMBER = { id: 'u1', name: 'Marc Lewis', email: 'marc@example.com', intake: 'Busk', status: 'approved' as const, role: 'Dean', employer: 'School of Communication Arts' };

export const MOCK_DATA: Record<string, unknown> = {
  approved: [
    MOCK_MEMBER,
    { id: 'u2', name: 'Priya Nair', intake: 'Busk', status: 'approved', role: 'Creative Director', employer: 'Northlight', city: 'London', discipline: 'Art direction', openPublic: true },
    { id: 'u3', name: 'Tom Hartley', intake: 'Cymbals', status: 'approved', role: 'Copywriter', employer: 'Freelance', city: 'Manchester' },
    { id: 'u4', name: 'Jess Okoro', intake: 'Dominatrix', status: 'approved' },
  ],
  pending: [{ id: 'u9', name: 'Sam Reid', intake: 'Hush', status: 'pending', note: 'We painted the studio wall red the night before portfolio day.' }],
  member: { id: 'u2', name: 'Priya Nair', intake: 'Busk', status: 'approved', role: 'Creative Director', employer: 'Northlight', city: 'London', discipline: 'Art direction', openPublic: true, portfolio: 'example.com' },
  check: { id: 'u9', known: true, onList: true, acIntake: 'Hush' },
  contact: { id: 'u9', email: 'sam@example.com' },
  jobs: [
    { id: 'j1', title: 'Senior Art Director', company: 'Northlight', location: 'London', kind: 'Full-time', postedBy: 'u2', postedByName: 'Priya Nair', status: 'live', marcSays: 'Priya runs a proper department. If you want to make famous work, talk to her.', description: 'Lead art direction across two flagship accounts. Hybrid, three days in Soho.', createdAt: s(2) },
    { id: 'j2', title: 'Copywriter, 3 months', company: 'Field & Fable', location: 'Remote', kind: 'Freelance', postedBy: 'u3', postedByName: 'Tom Hartley', status: 'live', marcSays: 'Good people, fair day rate, real briefs.', createdAt: s(30) },
  ],
  myJobs: [{ id: 'j3', title: 'Junior Creative Team', company: 'School of Communication Arts', kind: 'Placement', postedBy: 'u1', postedByName: 'Marc Lewis', status: 'pending', createdAt: s(1) }],
  pendingJobs: [{ id: 'j4', title: 'Design Lead', company: 'Harbour Studio', location: 'Bristol', kind: 'Contract', postedBy: 'u3', postedByName: 'Tom Hartley', status: 'pending', description: 'Six month contract leading a rebrand.', createdAt: s(3) }],
  job: { id: 'j1', title: 'Senior Art Director', company: 'Northlight', location: 'London', kind: 'Full-time', postedBy: 'u2', postedByName: 'Priya Nair', status: 'live', marcSays: 'Priya runs a proper department. If you want to make famous work, talk to her.', description: 'Lead art direction across two flagship accounts. Hybrid, three days in Soho.', createdAt: s(2) },
  myInterest: [],
  newInterest: [{ id: 'j1_u4', jobId: 'j1', jobTitle: 'Senior Art Director', company: 'Northlight', uid: 'u4', name: 'Jess Okoro', intake: 'Dominatrix', note: 'Two years in-house, ready for agency side.', status: 'new', createdAt: s(1) }],
  open: [{ id: 'u2', name: 'Priya Nair', intake: 'Busk', visibility: 'all' }, { id: 'u3', name: 'Tom Hartley', intake: 'Cymbals', visibility: 'team' }],
  events: [
    { id: 'e1', title: 'Winter reunion', date: '2099-12-12', time: '6.30pm', place: 'A pub in Soho', description: 'Every intake welcome. First round is on the school.' },
    { id: 'e2', title: 'Portfolio day', date: '2099-12-20', time: '10am', place: 'Northlight, London' },
  ],
  event: { id: 'e1', title: 'Winter reunion', date: '2099-12-12', time: '6.30pm', place: 'A pub in Soho', description: 'Every intake welcome. First round is on the school.' },
  going: [{ id: 'u2', name: 'Priya Nair', intake: 'Busk' }, { id: 'u3', name: 'Tom Hartley', intake: 'Cymbals' }],
  announcements: [{ id: 'a1', body: 'Winter reunion is on. 12 December, a pub in Soho. Bring your book.', audience: 'all', createdAt: s(5) }],
  classes: [
    { id: 'c1', title: 'How to have an idea', mentor: 'Marc Lewis', topic: 'Ideas', minutes: '48', url: 'https://example.com', createdAt: s(4) },
    { id: 'c2', title: 'Writing headlines that travel', mentor: 'Guest mentor', topic: 'Copy', minutes: '36', url: 'https://example.com', createdAt: s(9) },
  ],
  reports: [{ id: 'r1', byName: 'Jess Okoro', about: 'u3', aboutName: 'Tom Hartley', where: 'the Busk room', text: 'A message somebody flagged.', status: 'new', createdAt: s(1) }],
  settings: { id: 'u1', blocked: [] },
  dms: [{ id: 'u1_u2', members: ['u1', 'u2'], names: { u1: 'Marc Lewis', u2: 'Priya Nair' }, lastText: 'See you at the reunion?', updatedAt: s(1) }],
  dm: { id: 'u1_u2', members: ['u1', 'u2'], names: { u1: 'Marc Lewis', u2: 'Priya Nair' } },
  messages: [
    { id: 'm3', uid: 'u1', name: 'Marc Lewis', text: 'Wouldn’t miss it.', createdAt: s(1) },
    { id: 'm2', uid: 'u2', name: 'Priya Nair', text: 'See you at the reunion?', createdAt: s(2) },
    { id: 'm1', uid: 'u2', name: 'Priya Nair', text: 'Did you see the Northlight job?', createdAt: s(3) },
  ],
};
