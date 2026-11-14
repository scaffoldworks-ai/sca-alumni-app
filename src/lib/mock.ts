/**
 * Design-check mode. Built with EXPO_PUBLIC_MOCK=1 the app skips sign-in and shows
 * made-up sample data, so screens can be reviewed without touching the real database.
 * It is never switched on in the builds people use.
 */
export const MOCK = process.env.EXPO_PUBLIC_MOCK === '1';

const s = (n: number) => ({ seconds: 1794650000 - n * 3600 });

export const MOCK_MEMBER = { id: 'u1', name: 'Sample Dean', email: 'dean@example.com', intake: 'Busk', status: 'approved' as const, role: 'Dean', employer: 'Sample School' };

export const MOCK_DATA: Record<string, unknown> = {
  approved: [
    MOCK_MEMBER,
    { id: 'u2', name: 'Ada Sample', intake: 'Busk', status: 'approved', role: 'Creative Director', employer: 'Example Agency', city: 'London', discipline: 'Art direction', openPublic: true },
    { id: 'u3', name: 'Ben Placeholder', intake: 'Cymbals', status: 'approved', role: 'Copywriter', employer: 'Freelance', city: 'Manchester' },
    { id: 'u4', name: 'Cleo Example', intake: 'Dominatrix', status: 'approved' },
  ],
  pending: [{ id: 'u9', name: 'Dan Waiting', intake: 'Hush', status: 'pending', note: 'We painted the studio wall red the night before portfolio day.' }],
  member: { id: 'u2', name: 'Ada Sample', intake: 'Busk', status: 'approved', role: 'Creative Director', employer: 'Example Agency', city: 'London', discipline: 'Art direction', openPublic: true, portfolio: 'example.com' },
  contact: { id: 'u9', email: 'dan@example.com' },
  jobs: [
    { id: 'j1', title: 'Senior Art Director', company: 'Example Agency', location: 'London', kind: 'Full-time', postedBy: 'u2', postedByName: 'Ada Sample', status: 'live', marcSays: 'Ada runs a proper department. If you want to make famous work, talk to her.', description: 'Lead art direction across two flagship accounts. Hybrid, three days in Soho.', createdAt: s(2) },
    { id: 'j2', title: 'Copywriter, 3 months', company: 'Sample Studio', location: 'Remote', kind: 'Freelance', postedBy: 'u3', postedByName: 'Ben Placeholder', status: 'live', marcSays: 'Good people, fair day rate, real briefs.', createdAt: s(30) },
  ],
  myJobs: [{ id: 'j3', title: 'Junior Creative Team', company: 'Sample School', kind: 'Placement', postedBy: 'u1', postedByName: 'Sample Dean', status: 'pending', createdAt: s(1) }],
  pendingJobs: [{ id: 'j4', title: 'Design Lead', company: 'Placeholder & Co', location: 'Bristol', kind: 'Contract', postedBy: 'u3', postedByName: 'Ben Placeholder', status: 'pending', description: 'Six month contract leading a rebrand.', createdAt: s(3) }],
  job: { id: 'j1', title: 'Senior Art Director', company: 'Example Agency', location: 'London', kind: 'Full-time', postedBy: 'u2', postedByName: 'Ada Sample', status: 'live', marcSays: 'Ada runs a proper department. If you want to make famous work, talk to her.', description: 'Lead art direction across two flagship accounts. Hybrid, three days in Soho.', createdAt: s(2) },
  myInterest: [],
  newInterest: [{ id: 'j1_u4', jobId: 'j1', jobTitle: 'Senior Art Director', company: 'Example Agency', uid: 'u4', name: 'Cleo Example', intake: 'Dominatrix', note: 'Two years in-house, ready for agency side.', status: 'new', createdAt: s(1) }],
  open: [{ id: 'u2', name: 'Ada Sample', intake: 'Busk', visibility: 'all' }, { id: 'u3', name: 'Ben Placeholder', intake: 'Cymbals', visibility: 'team' }],
  events: [
    { id: 'e1', title: 'Winter reunion', date: '2099-12-12', time: '6.30pm', place: 'A pub in Soho', description: 'Every intake welcome. First round is on the school.' },
    { id: 'e2', title: 'Portfolio day', date: '2099-12-20', time: '10am', place: 'Example Agency, London' },
  ],
  event: { id: 'e1', title: 'Winter reunion', date: '2099-12-12', time: '6.30pm', place: 'A pub in Soho', description: 'Every intake welcome. First round is on the school.' },
  going: [{ id: 'u2', name: 'Ada Sample', intake: 'Busk' }, { id: 'u3', name: 'Ben Placeholder', intake: 'Cymbals' }],
  announcements: [{ id: 'a1', body: 'Winter reunion is on. 12 December, a pub in Soho. Bring your book.', audience: 'all', createdAt: s(5) }],
  classes: [
    { id: 'c1', title: 'How to have an idea', mentor: 'A. Mentor', topic: 'Ideas', minutes: '48', url: 'https://example.com', createdAt: s(4) },
    { id: 'c2', title: 'Writing headlines that travel', mentor: 'B. Mentor', topic: 'Copy', minutes: '36', url: 'https://example.com', createdAt: s(9) },
  ],
  reports: [{ id: 'r1', byName: 'Cleo Example', about: 'u3', aboutName: 'Ben Placeholder', where: 'the Busk room', text: 'Sample of a message somebody flagged.', status: 'new', createdAt: s(1) }],
  settings: { id: 'u1', blocked: [] },
  dms: [{ id: 'u1_u2', members: ['u1', 'u2'], names: { u1: 'Sample Dean', u2: 'Ada Sample' }, lastText: 'See you at the reunion?', updatedAt: s(1) }],
  dm: { id: 'u1_u2', members: ['u1', 'u2'], names: { u1: 'Sample Dean', u2: 'Ada Sample' } },
  messages: [
    { id: 'm3', uid: 'u1', name: 'Sample Dean', text: 'Wouldn’t miss it.', createdAt: s(1) },
    { id: 'm2', uid: 'u2', name: 'Ada Sample', text: 'See you at the reunion?', createdAt: s(2) },
    { id: 'm1', uid: 'u2', name: 'Ada Sample', text: 'Hello from the sample data.', createdAt: s(3) },
  ],
};
