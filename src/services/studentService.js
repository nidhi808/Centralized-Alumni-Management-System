import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, updateDoc, addDoc, serverTimestamp, setDoc, arrayUnion } from 'firebase/firestore';

export function subscribeToApprovedEvents(callback) {
  // Fetch all events for students (we assume they are approved unless explicitly rejected or we do client-side filtering)
  const q = query(collection(db, 'events'));
  
  return onSnapshot(q, (snap) => {
    // Only return events that aren't explicitly pending or rejected (handles legacy events without status)
    const events = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(e => e.status !== 'pending' && e.status !== 'rejected');
    
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

export function subscribeToAllAlumni(callback) {
  // Fetch merely by role to avoid composite index requirement
  const q = query(collection(db, 'users'), where('role', '==', 'alumni'));
  return onSnapshot(q, (snap) => {
    // Filter by approved status client-side
    const alumni = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(alum => alum.status === 'approved');
    callback(alumni);
  }, (err) => {
    console.error('Alumni listener error:', err);
    callback([]);
  });
}

export async function rsvpForEvent(eventId, userId) {
  try {
    // 1. Add to the event's attendees subcollection
    const rsvpRef = doc(db, 'events', eventId, 'attendees', userId);
    await setDoc(rsvpRef, {
      userId,
      createdAt: serverTimestamp()
    });

    // 2. Add the event ID to the user's personal RSVP array
    await updateDoc(doc(db, 'users', userId), {
      rsvps: arrayUnion(eventId)
    });

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
  return onSnapshot(doc(db, 'users', userId), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().rsvps || []);
    } else {
      callback([]);
    }
  });
}
