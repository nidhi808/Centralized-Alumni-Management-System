import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, getDoc, setDoc, onSnapshot, where } from 'firebase/firestore';
import { topAlumni, galleryImages, alumniLocations } from '../data/mockData';

const SUCCESS_STORIES_COLLECTION = 'success_stories';

export const addSuccessStory = async (userId, content, type = 'Achievement') => {
    try {
        // We first need the user's role and email to display on the feed
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        
        let authorRole = 'Alumni';
        let authorEmail = 'Unknown User';

        if (userDocSnap.exists()) {
             authorRole = userDocSnap.data().role;
             authorEmail = userDocSnap.data().email;
        }

        const docRef = await addDoc(collection(db, SUCCESS_STORIES_COLLECTION), {
            userId,
            authorName: authorEmail.split('@')[0], // Simple fallback for name
            authorRole: authorRole.charAt(0).toUpperCase() + authorRole.slice(1),
            avatar: `https://ui-avatars.com/api/?name=${authorEmail.split('@')[0]}&background=random`,
            content,
            type,
            likes: 0,
            comments: 0,
            timestamp: serverTimestamp(),
            tags: ['New']
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const getSuccessStories = async () => {
    try {
        let stories = [];
        // 1. Fetch user success stories
        try {
            const q = query(collection(db, SUCCESS_STORIES_COLLECTION), orderBy('timestamp', 'desc'));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                stories.push({
                    id: doc.id,
                    ...data,
                    timestampStr: data.timestamp ? data.timestamp.toDate().toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    }) : 'Just now',
                    rawTime: data.timestamp?.toMillis() || 0
                });
            });
        } catch (err) {
            console.warn("Fallback success_stories fetch:", err);
            const q = query(collection(db, SUCCESS_STORIES_COLLECTION));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                stories.push({
                    id: doc.id,
                    ...data,
                    timestampStr: data.timestamp ? data.timestamp.toDate().toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    }) : 'Just now',
                    rawTime: data.timestamp?.toMillis() || 0
                });
            });
        }

        // 2. Fetch admin curated success feed
        try {
            const adminQ = query(collection(db, 'success_feed'));
            const adminSnap = await getDocs(adminQ);
            adminSnap.forEach((doc) => {
                const data = doc.data();
                stories.push({
                    id: `admin-${doc.id}`,
                    authorName: data.name,
                    authorRole: 'Alumni',
                    content: data.achievement,
                    company: data.company,
                    role: data.role,
                    dept: data.dept,
                    timestampStr: data.createdAt ? data.createdAt.toDate().toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric'
                    }) : 'Just now',
                    likes: 0,
                    comments: 0,
                    rawTime: data.createdAt?.toMillis() || Date.now(),
                    tags: data.company ? [data.company] : ['Admin']
                });
            });
        } catch (err) {
            console.error("Error fetching admin success feed", err);
        }

        stories.sort((a, b) => b.rawTime - a.rawTime);

        // Normalize timestamp back
        return stories.map(s => ({
            ...s,
            timestamp: s.timestampStr
        }));
    } catch (e) {
        console.error("Error fetching documents: ", e);
        throw e;
    }
};

export const subscribeToPublicAnnouncements = (callback) => {
    // Only subscribe to announcements intended for all audiences 
    // Or we could fetch all announcements for the global feed, keeping it simple
    // The previous implementation used mockData which was just an array of items. 
    // We will listen to the 'announcements' collection.
    const q = query(
        collection(db, 'announcements'),
        // Let's also support fetching regular announcements if some don't have targetAudience set
        // where('targetAudience', '==', 'all'),
        orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
        const announcementsList = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            announcementsList.push({
                id: doc.id,
                ...data,
                // Format the timestamp if it exists, otherwise use a placeholder
                date: data.createdAt ? data.createdAt.toDate().toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                }) : 'Just now',
            });
        });
        callback(announcementsList);
    }, (error) => {
        console.error("Error subscribing to announcements: ", error);
        callback([]);
    });
};

export const subscribeToApprovedJobs = (callback) => {
    // Only fetch jobs that have been approved by the admin
    const q = query(
        collection(db, 'jobs'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
        const jobs = [];
        snapshot.forEach((doc) => {
            jobs.push({ id: doc.id, ...doc.data() });
        });
        callback(jobs);
    }, (error) => {
        console.error("Error subscribing to approved jobs (may need index): ", error);
        // Fallback without ordering
        const q2 = query(collection(db, 'jobs'), where('status', '==', 'approved'));
        onSnapshot(q2, (snap2) => {
             const jobs2 = [];
             snap2.forEach(d => jobs2.push({id: d.id, ...d.data()}));
             callback(jobs2);
        });
    });
};

export const fetchOrSeedCollection = async (collectionName, seedData) => {
    try {
        const q = query(collection(db, collectionName));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            console.log(`Seeding ${collectionName} with initial data...`);
            const promises = seedData.map(async (item) => {
                const docRef = doc(db, collectionName, item.id.toString());
                await setDoc(docRef, { ...item, createdAt: serverTimestamp() });
                return { ...item, id: item.id.toString() };
            });
            return await Promise.all(promises);
        }

        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error(`Error fetching/seeding ${collectionName}:`, e);
        return seedData; // Fallback to mock data if Firestore fails
    }
};

export const getTopAlumni = () => fetchOrSeedCollection('topAlumni', topAlumni);
export const getGalleryImages = () => fetchOrSeedCollection('gallery', galleryImages);
export const getAlumniLocations = () => fetchOrSeedCollection('alumniLocations', alumniLocations);
