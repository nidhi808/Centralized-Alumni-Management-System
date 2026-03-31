import { db } from '../firebase';
import {
  collection, addDoc, getDocs, getDoc, doc, updateDoc,
  query, where, orderBy, onSnapshot, serverTimestamp,
  deleteDoc, limit, getCountFromServer
} from 'firebase/firestore';

// ─── ADMIN STATS ─────────────────────────────────────────
export function subscribeToTotalAlumni(callback) {
  const q = query(collection(db, 'users'), where('role', '==', 'alumni'));
  return onSnapshot(q, (snap) => callback(snap.size));
}

export function subscribeToTotalStudents(callback) {
  const q = query(collection(db, 'users'), where('role', '==', 'student'));
  return onSnapshot(q, (snap) => callback(snap.size));
}

export function subscribeToTotalFaculty(callback) {
  const q = query(collection(db, 'users'), where('role', '==', 'faculty'));
  return onSnapshot(q, (snap) => callback(snap.size));
}

export function subscribeToPendingJobs(callback) {
  const q = query(collection(db, 'jobs'), where('status', '==', 'pending_admin_approval'));
  return onSnapshot(q, (snap) => callback(snap.size));
}

export function subscribeToEventsThisMonth(callback) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const q = query(collection(db, 'events'), where('createdAt', '>=', startOfMonth));
  return onSnapshot(q, (snap) => callback(snap.size), () => callback(0));
}

// ─── USER MANAGEMENT ──────────────────────────────────────
export function subscribeToUsersByRole(role, callback) {
  const q = query(collection(db, 'users'), where('role', '==', role));
  return onSnapshot(q, (snap) => {
    const users = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    users.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
    });
    callback(users);
  });
}

export async function updateUserStatus(userId, status) {
  await updateDoc(doc(db, 'users', userId), { status });
}

export async function deleteUser(userId) {
  await deleteDoc(doc(db, 'users', userId));
}

// ─── JOB APPROVALS ────────────────────────────────────────
export function subscribeToPendingJobsList(callback) {
  const q = query(collection(db, 'jobs'), where('status', '==', 'pending_admin_approval'));
  return onSnapshot(q, (snap) => {
    const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    jobs.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeB - timeA;
    });
    callback(jobs);
  });
}

export function subscribeToAllJobs(callback) {
  const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(jobs);
  }, (err) => {
    console.warn("Using fallback sorting for jobs", err);
    const q2 = query(collection(db, 'jobs'));
    onSnapshot(q2, (snap) => {
      const jobs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      jobs.sort((a, b) => ((b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      callback(jobs);
    });
  });
}

export async function approveJob(jobId, notifyUserId) {
  await updateDoc(doc(db, 'jobs', jobId), { status: 'approved', approvedAt: serverTimestamp() });
  // Send notification to the job poster
  if (notifyUserId) {
    await addDoc(collection(db, 'notifications'), {
      userId: notifyUserId,
      type: 'job_approved',
      message: 'Your job posting has been approved by the admin!',
      read: false,
      createdAt: serverTimestamp(),
    });
  }
}

export async function rejectJob(jobId, notifyUserId, reason = '') {
  await updateDoc(doc(db, 'jobs', jobId), { status: 'rejected', rejectedAt: serverTimestamp(), rejectReason: reason });
  if (notifyUserId) {
    await addDoc(collection(db, 'notifications'), {
      userId: notifyUserId,
      type: 'job_rejected',
      message: `Your job posting was not approved. ${reason ? 'Reason: ' + reason : ''}`,
      read: false,
      createdAt: serverTimestamp(),
    });
  }
}

export async function deleteJob(jobId) {
  await deleteDoc(doc(db, 'jobs', jobId));
}

// ─── EVENTS ────────────────────────────────────────────────
export function subscribeToAllEvents(callback) {
  const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const eventsList = [];
    snapshot.forEach((doc) => {
      eventsList.push({ id: doc.id, ...doc.data() });
    });
    callback(eventsList);
  }, () => {
    // Fallback without ordering
    const q2 = query(collection(db, 'events'));
    onSnapshot(q2, (snap2) => {
      const events2 = [];
      snap2.forEach(d => events2.push({id: d.id, ...d.data()}));
      callback(events2);
    });
  });
}

export async function deleteEvent(eventId) {
    await deleteDoc(doc(db, 'events', eventId));
}

// ─── DEPARTMENT ANALYTICS ──────────────────────────────────
export async function getDepartmentStats() {
  const depts = ['CS', 'EE', 'ME', 'CE', 'CH', 'PH', 'MA', 'HS'];
  const results = [];
  for (const dept of depts) {
    try {
      const alumniQ = query(collection(db, 'users'), where('role', '==', 'alumni'), where('dept', '==', dept));
      const jobsQ = query(collection(db, 'jobs'), where('dept', '==', dept), where('status', '==', 'approved'));
      const [alumniSnap, jobsSnap] = await Promise.all([getDocs(alumniQ), getDocs(jobsQ)]);
      if (alumniSnap.size > 0 || jobsSnap.size > 0) {
        results.push({ dept, alumni: alumniSnap.size, placements: jobsSnap.size });
      }
    } catch (e) { /* skip */ }
  }
  return results.length > 0 ? results : [
    { dept: 'CS', alumni: 142, placements: 89 },
    { dept: 'EE', alumni: 98, placements: 54 },
    { dept: 'ME', alumni: 75, placements: 41 },
    { dept: 'CE', alumni: 63, placements: 28 },
    { dept: 'CH', alumni: 45, placements: 19 },
  ];
}

// ─── NOTIFICATIONS (Admin) ─────────────────────────────────
export function subscribeToAdminNotifications(callback) {
  const q = query(
    collection(db, 'notifications'),
    where('type', 'in', ['job_pending', 'new_user', 'support_request']),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(notifs);
  }, () => callback([]));
}

export function subscribeToPendingApprovals(callback) {
  const q = query(collection(db, 'jobs'), where('status', '==', 'pending_admin_approval'));
  return onSnapshot(q, (snap) => callback(snap.size), () => callback(0));
}

// ─── INBOX / MESSAGES ─────────────────────────────────────
export function subscribeToAdminMessages(callback) {
  const q = query(
    collection(db, 'admin_messages'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(msgs);
  }, () => callback([]));
}

export async function sendAdminReply(originalMsgId, replyText, toUserId) {
  await addDoc(collection(db, 'admin_messages'), {
    type: 'admin_reply',
    replyTo: originalMsgId,
    toUserId,
    text: replyText,
    fromAdmin: true,
    createdAt: serverTimestamp(),
    read: false,
  });
}

// ─── GLOBAL ANNOUNCEMENTS ──────────────────────────────────
export async function createGlobalAnnouncement(data) {
  return addDoc(collection(db, 'announcements'), {
    ...data,
    targetAudience: 'all',
    createdAt: serverTimestamp(),
  });
}

export function subscribeToGlobalAnnouncements(callback) {
  const q = query(collection(db, 'announcements'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    items.sort((a, b) => ((b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
    callback(items);
  }, (err) => {
    console.warn("Announcements error:", err);
    callback([]);
  });
}

export async function deleteAnnouncement(id) {
  await deleteDoc(doc(db, 'announcements', id));
}

// ─── SUCCESS FEED ──────────────────────────────────────────
export function subscribeToSuccessFeed(callback) {
  const q = query(collection(db, 'success_feed'), orderBy('createdAt', 'desc'));
  
  const processSnap = (snap) => {
    const items = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id, ...data,
        timestamp: data.createdAt
          ? data.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Just now',
      };
    });
    return items;
  };

  return onSnapshot(q, (snap) => {
    callback(processSnap(snap));
  }, (err) => {
    console.warn("Fallback success feed fetch without ordering:", err);
    const fallbackQ = query(collection(db, 'success_feed'));
    onSnapshot(fallbackQ, (fSnap) => {
      const items = processSnap(fSnap);
      items.sort((a, b) => ((b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)));
      callback(items);
    });
  });
}

export async function addSuccessFeedItem(data) {
  return addDoc(collection(db, 'success_feed'), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function deleteSuccessFeedItem(id) {
  await deleteDoc(doc(db, 'success_feed', id));
}
// ─── HELPDESK / FEEDBACK ──────────────────────────────────
export function subscribeToFeedbacks(callback) {
  const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  }, () => callback([]));
}

export function subscribeToBugReports(callback) {
  const q = query(collection(db, 'bug_reports'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  }, () => callback([]));
}

// ─── SITE SETTINGS ─────────────────────────────────────────
export async function getSiteSettings() {
  const snap = await getDoc(doc(db, 'site_config', 'main'));
  return snap.exists() ? snap.data() : { maintenanceMode: false, bannerText: '', bannerColor: '#086490' };
}

export async function updateSiteSettings(data) {
  const ref = doc(db, 'site_config', 'main');
  try {
    await updateDoc(ref, data);
  } catch (e) {
    await addDoc(collection(db, 'site_config'), data);
  }
}
