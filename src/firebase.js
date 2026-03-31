import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAIFp1bGOqwJnHX4RvSQV1JKV-_zMMMFaU",
    authDomain: "alumniconnect-55eb6.firebaseapp.com",
    projectId: "alumniconnect-55eb6",
    storageBucket: "alumniconnect-55eb6.firebasestorage.app",
    messagingSenderId: "638157284972",
    appId: "1:638157284972:web:9064a2463cade310ff9a49",
    measurementId: "G-YXCF5PM34H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
