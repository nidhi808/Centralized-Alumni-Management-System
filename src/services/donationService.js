import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const DONATIONS_COLLECTION = 'donations';

/**
 * Save a new donation to Firestore
 */
export const submitDonation = async (donationData) => {
    try {
        const docRef = await addDoc(collection(db, DONATIONS_COLLECTION), {
            ...donationData,
            createdAt: serverTimestamp(),
            status: 'completed', // Real apps would have 'pending' for payment gateway integration
        });
        return docRef.id;
    } catch (error) {
        console.error("Error submitting donation: ", error);
        throw error;
    }
};

/**
 * Subscribe to all donations for admin dashboard analytics
 * Returns an unsubscribe function.
 */
export const subscribeToDonations = (callback) => {
    const q = query(
        collection(db, DONATIONS_COLLECTION),
        orderBy('createdAt', 'desc')
    );

    const processSnapshot = (snapshot) => {
        const donationsList = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            donationsList.push({
                id: doc.id,
                ...data,
                date: data.createdAt ? data.createdAt.toDate().toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                }) : 'Just now',
            });
        });
        return donationsList;
    };

    return onSnapshot(q, (snapshot) => {
        callback(processSnapshot(snapshot));
    }, (error) => {
        console.warn("Fallback donations fetch without ordering", error);
        const fallbackQ = query(collection(db, DONATIONS_COLLECTION));
        onSnapshot(fallbackQ, (fSnap) => {
            const list = processSnapshot(fSnap);
            list.sort((a,b) => {
               const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
               const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
               return timeB - timeA;
            });
            callback(list);
        });
    });
};

export const subscribeToMyDonations = (userId, callback) => {
    if (!userId) return () => {};
    
    const q = query(
        collection(db, DONATIONS_COLLECTION),
        where('donorId', '==', userId)
        // orderBy removed to avoid needing composite index
    );

    return onSnapshot(q, (snapshot) => {
        const donationsList = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            donationsList.push({
                id: doc.id,
                ...data,
                date: data.createdAt ? data.createdAt.toDate().toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
                }) : 'Just now',
            });
        });

        // Client-side sort by newest first
        donationsList.sort((a, b) => {
            const timeA = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
            const timeB = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
            return timeB - timeA;
        });

        callback(donationsList);
    }, (error) => {
        console.error("Error with live updates:", error);
        callback([]);
    });
};
