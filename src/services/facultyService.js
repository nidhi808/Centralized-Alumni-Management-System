import { db } from '../firebase';
import {
  collection, addDoc, getDocs, getDoc, doc, updateDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc,
  setDoc, arrayUnion
} from 'firebase/firestore';

// ─── STATS ───────────────────────────────────────────────
export function subscribeToDeptAlumniCount(dept, callback) {
  const constraints = [where('role', '==', 'alumni')];
  if (dept && dept !== 'All') constraints.push(where('dept', '==', dept));
  const q = query(collection(db, 'users'), ...constraints);
  return onSnapshot(q, (snap) => callback(snap.size));
}

export function subscribeToPendingVerifications(dept, callback) {
  const constraints = [where('role', '==', 'alumni'), where('status', '==', 'pending')];
  if (dept && dept !== 'All') constraints.push(where('dept', '==', dept));
  const q = query(collection(db, 'users'), ...constraints);
  return onSnapshot(q, (snap) => callback(snap.size));
}

export function subscribeToTotalStudents(dept, callback) {
  const constraints = [where('role', '==', 'student')];
  if (dept && dept !== 'All') constraints.push(where('dept', '==', dept));
  const q = query(collection(db, 'users'), ...constraints);
  return onSnapshot(q, (snap) => callback(snap.size));
}

export function subscribeToTotalEvents(authorId, callback) {
  const q = query(
    collection(db, 'events'),
    where('authorId', '==', authorId)
  );
  return onSnapshot(q, (snap) => callback(snap.size));
}

// ─── EVENTS ──────────────────────────────────────────────
export async function createEvent(eventData) {
  const docRef = await addDoc(collection(db, 'events'), {
    ...eventData,
    createdAt: serverTimestamp(),
  });
  // Auto-create announcement when event is created
  await addDoc(collection(db, 'announcements'), {
    title: `New Event: ${eventData.title}`,
    content: eventData.description,
    type: 'event',
    eventId: docRef.id,
    targetAudience: 'department_alumni',
    dept: eventData.dept,
    authorId: eventData.authorId,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToEvents(authorId, callback) {
  // This originally fetched only events authored by the faculty.
  // We'll rename or keep it for backwards compability, but actually we should just fetch ALL events
  // or add a new method.
  const q = query(collection(db, 'events'));
  // Removed authorId where clause to show ALL events
  
  return onSnapshot(q, (snap) => {
    const events = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    events.sort((a, b) => {
      const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
      const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
    
    callback(events);
  }, (error) => {
    console.error('Events listener error:', error);
    callback([]);
  });
}

export async function rsvpForEvent(eventId, userId) {
  try {
    // 1. Add to the event's attendees subcollection (allowed by existing deployed rules)
    const rsvpRef = doc(db, 'events', eventId, 'attendees', userId);
    await setDoc(rsvpRef, {
      userId,
      createdAt: serverTimestamp()
    });

    // 2. Add the event ID to the user's personal RSVP array (allowed by existing deployed rules)
    await updateDoc(doc(db, 'users', userId), {
      rsvps: arrayUnion(eventId)
    });

    // Optional: increment attendee count on event
    await updateDoc(doc(db, 'events', eventId), {
      attendees: (await getDoc(doc(db, 'events', eventId))).data()?.attendees + 1 || 1
    }).catch(() => {});
    
    return true;
  } catch (error) {
    console.error("Error doing RSVP:", error);
    throw error;
  }
}

export function subscribeToUserRSVPs(userId, callback) {
  // Listen to the user's document which contains the `rsvps` array
  return onSnapshot(doc(db, 'users', userId), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().rsvps || []);
    } else {
      callback([]);
    }
  });
}



export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, 'events', eventId));
}

// ─── JOBS ────────────────────────────────────────────────
export async function createJob(jobData) {
  const docRef = await addDoc(collection(db, 'jobs'), {
    ...jobData,
    status: 'pending_admin_approval',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToFacultyJobs(authorId, callback) {
  const q = query(
    collection(db, 'jobs'),
    where('authorId', '==', authorId)
    // removed orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    jobs.sort((a, b) => {
      const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
      const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
    callback(jobs);
  }, (error) => {
    console.error('Jobs listener error:', error);
    callback([]);
  });
}

export async function approveJob(jobId) {
  await updateDoc(doc(db, 'jobs', jobId), { status: 'approved' });
}

export async function deleteJob(jobId) {
  await deleteDoc(doc(db, 'jobs', jobId));
}

// ─── ALUMNI DIRECTORY ────────────────────────────────────
export function subscribeToDeptAlumni(dept, callback) {
  const constraints = [where('role', '==', 'alumni')];
  if (dept && dept !== 'All') constraints.push(where('dept', '==', dept));
  const q = query(collection(db, 'users'), ...constraints);
  return onSnapshot(q, (snap) => {
    const alumni = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(alumni);
  });
}

// ─── CONNECTIONS ─────────────────────────────────────────
export async function sendConnectionRequest(fromId, toId) {
  return addDoc(collection(db, 'connections'), {
    fromId,
    toId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

export function subscribeToConnections(userId, callback) {
  const q = query(
    collection(db, 'connections'),
    where('fromId', '==', userId)
  );
  return onSnapshot(q, (snap) => {
    const conns = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(conns);
  });
}

export async function acceptConnection(connectionId) {
  await updateDoc(doc(db, 'connections', connectionId), { status: 'accepted' });
}

// ─── CHAT ────────────────────────────────────────────────
export async function sendMessage(chatId, senderId, text) {
  return addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(chatId, callback) {
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(msgs);
  });
}

// ─── ANNOUNCEMENTS ───────────────────────────────────────
export function subscribeToAnnouncements(dept, callback) {
  const constraints = [];
  if (dept && dept !== 'All') constraints.push(where('dept', '==', dept));
  const q = query(collection(db, 'announcements'), ...constraints);
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => {
      const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
      const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
    callback(items);
  }, (error) => {
    console.error('Announcements listener error:', error);
    callback([]);
  });
}

export async function createAnnouncement(data) {
  return addDoc(collection(db, 'announcements'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function deleteAnnouncement(annId) {
  await deleteDoc(doc(db, 'announcements', annId));
}

// ─── PROFILE ─────────────────────────────────────────────
export async function getFacultyProfile(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateFacultyProfile(userId, data) {
  await updateDoc(doc(db, 'users', userId), data);
}

// ─── SUCCESS FEED (Realtime) ───────── DEPRECATED ────────────────
