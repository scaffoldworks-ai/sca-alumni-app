/**
 * Server-side jobs for SCA Alumni.
 *
 * 1. When someone asks to join, check whether their email is on SCA's alumni
 *    list in ActiveCampaign and note the answer for the Dean.
 * 2. When the Dean approves someone, tag them in ActiveCampaign. An automation
 *    there sends the "You're in" email from Marc.
 *
 * Needs two secrets, set once with the Firebase tools:
 *   AC_API_URL  e.g. https://youraccount.api-us1.com
 *   AC_API_KEY  the ActiveCampaign API key
 */
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const AC_API_URL = defineSecret('AC_API_URL');
const AC_API_KEY = defineSecret('AC_API_KEY');
const options = { region: 'europe-west2', secrets: [AC_API_URL, AC_API_KEY], maxInstances: 5 };

// Names as they appear in ActiveCampaign.
const APPROVED_TAG = 'SCA Alumni App: Approved';
const APP_LIST_ID = '116'; // "SCA Alumni App Members" — ActiveCampaign only emails people who are on a list
const ALUMNI_TAG_ID = '1'; // "Alumni"
const ALUMNI_LIST_IDS = ['7', '82']; // "Alumni", "Master List SCA Alumni database"

async function ac(path, init = {}) {
  const base = AC_API_URL.value().trim().replace(/\/+$/, '');
  const res = await fetch(`${base}/api/3/${path}`, {
    ...init,
    headers: { 'Api-Token': AC_API_KEY.value().trim(), 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`ActiveCampaign ${path} answered ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : {};
}

async function emailFor(uid) {
  const snap = await db.doc(`contact/${uid}`).get();
  if (snap.exists && snap.data().email) return snap.data().email;
  const user = await admin.auth().getUser(uid);
  return user.email || '';
}

exports.checkAlumniList = onDocumentCreated({ ...options, document: 'members/{uid}' }, async (event) => {
  const uid = event.params.uid;
  try {
    // The contact record is written just after the member record, so give it a moment.
    await new Promise((r) => setTimeout(r, 3000));
    const email = await emailFor(uid);
    if (!email) return;
    const found = await ac(`contacts?email=${encodeURIComponent(email)}`);
    const contact = (found.contacts || [])[0];
    let onList = false;
    let acIntake = '';
    if (contact) {
      const [tags, lists, fields] = await Promise.all([
        ac(`contacts/${contact.id}/contactTags`),
        ac(`contacts/${contact.id}/contactLists`),
        ac(`contacts/${contact.id}/fieldValues`),
      ]);
      onList =
        (tags.contactTags || []).some((t) => String(t.tag) === ALUMNI_TAG_ID) ||
        (lists.contactLists || []).some((l) => ALUMNI_LIST_IDS.includes(String(l.list)) && String(l.status) === '1');
      const intake = (fields.fieldValues || []).find((f) => String(f.field) === '62'); // "SCA Intake"
      acIntake = (intake && intake.value) || '';
    }
    await db.doc(`checks/${uid}`).set({ known: !!contact, onList, acIntake, checkedAt: admin.firestore.FieldValue.serverTimestamp() });
  } catch (err) {
    logger.error('Alumni list check failed', { uid, message: String(err) });
  }
});

exports.onMemberApproved = onDocumentUpdated({ ...options, document: 'members/{uid}' }, async (event) => {
  const before = event.data.before.data();
  const after = event.data.after.data();
  if (before.status === 'approved' || after.status !== 'approved') return;
  const uid = event.params.uid;
  try {
    const email = await emailFor(uid);
    if (!email) return;
    const [firstName, ...rest] = String(after.name || '').trim().split(/\s+/);
    const synced = await ac('contact/sync', { method: 'POST', body: JSON.stringify({ contact: { email, firstName: firstName || '', lastName: rest.join(' ') } }) });
    const contactId = synced.contact && synced.contact.id;
    if (!contactId) throw new Error('No contact came back from ActiveCampaign');

    await ac('contactLists', { method: 'POST', body: JSON.stringify({ contactList: { list: APP_LIST_ID, contact: contactId, status: 1 } }) });

    const search = await ac(`tags?search=${encodeURIComponent(APPROVED_TAG)}`);
    let tag = (search.tags || []).find((t) => t.tag === APPROVED_TAG);
    if (!tag) {
      const made = await ac('tags', { method: 'POST', body: JSON.stringify({ tag: { tag: APPROVED_TAG, tagType: 'contact', description: 'Approved to join the SCA Alumni app' } }) });
      tag = made.tag;
    }
    await ac('contactTags', { method: 'POST', body: JSON.stringify({ contactTag: { contact: contactId, tag: tag.id } }) });
    logger.info('Approved member tagged in ActiveCampaign', { uid });
  } catch (err) {
    logger.error('Approval follow-up failed', { uid, message: String(err) });
  }
});
