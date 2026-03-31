import React, { useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = React.createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userStatus, setUserStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password, role, additionalData = {}) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Determine initial status based on role
            let initialStatus = 'approved';
            if (role === 'alumni') initialStatus = 'pending';
            if (role === 'student') initialStatus = 'pending_admin_approval';
            
            // Store user role in Firestore
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                role: role,
                status: initialStatus,
                createdAt: new Date(),
                ...additionalData
            });
            setUserRole(role);
            setUserStatus(initialStatus);
            return user;
        } catch (err) {
            console.error("Signup failed.", err);
            throw err;
        }
    }

    async function login(email, password) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        try {
            const docRef = doc(db, "users", cred.user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserRole(data.role);
                setUserStatus(data.status || 'approved');
            } else {
                setUserRole(null);
                setUserStatus(null);
            }
            setCurrentUser(cred.user);
        } catch (err) {
            console.error("Failed to fetch user role during login.", err);
        }
        return cred;
    }

    function logout() {
        return signOut(auth);
    }

    function resetPassword(email) {
        // Implement reset password if needed
        return Promise.resolve();
    }

    async function updateDisplayName(newName) {
        if (!auth.currentUser) return;
        try {
            await updateProfile(auth.currentUser, { displayName: newName });
            setCurrentUser({ ...auth.currentUser, displayName: newName });
        } catch (err) {
            console.error("Failed to update display name", err);
            throw err;
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch user role from Firestore
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserRole(data.role);
                        setUserStatus(data.status || 'approved');
                    } else {
                        setUserRole(null);
                        setUserStatus(null);
                    }
                } catch (err) {
                    console.error("Failed to fetch user role from Firestore. Check your Firestore Security Rules.", err);
                    setUserRole(null);
                    setUserStatus(null);
                }
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setUserRole(null);
                setUserStatus(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole,
        userStatus,
        loading,
        signup,
        login,
        logout,
        resetPassword,
        updateDisplayName,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
