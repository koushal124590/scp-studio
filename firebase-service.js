// Firebase SDK 10.13.0 Integration for SCP Studio
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc, 
    collection, 
    addDoc, 
    getDocs, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDwgirpaSCSblwsDyl85oicF3wGCyw31Q4",
  authDomain: "scp-studio-da6c8.firebaseapp.com",
  projectId: "scp-studio-da6c8",
  storageBucket: "scp-studio-da6c8.firebasestorage.app",
  messagingSenderId: "449331101955",
  appId: "1:449331101955:web:60402c29f6cb443ed5e936"
};

// Initialize App, Auth & Firestore
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// User Sync with Firestore Database
export async function syncUserToDatabase(user, customData = {}) {
    if (!user) return null;
    try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        
        let userData;
        if (!snap.exists()) {
            userData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || customData.name || user.email.split('@')[0],
                plan: "Business Pro",
                credits: 500,
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                ...customData
            };
            await setDoc(userRef, userData);
        } else {
            userData = snap.data();
            await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
        }
        
        // Cache to local storage for instant sync across tabs
        localStorage.setItem('vectorizerUser', JSON.stringify({
            uid: user.uid,
            email: user.email,
            name: userData.name || user.displayName || user.email.split('@')[0],
            plan: userData.plan || "Business Pro",
            credits: userData.credits !== undefined ? userData.credits : 500
        }));
        
        return userData;
    } catch (err) {
        console.warn("Firestore sync warning (offline or permissions fallback):", err);
        const fallback = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || customData.name || user.email.split('@')[0],
            plan: "Business Pro",
            credits: 500
        };
        localStorage.setItem('vectorizerUser', JSON.stringify(fallback));
        return fallback;
    }
}

// Google Sign-In
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await syncUserToDatabase(result.user);
        return { success: true, user: result.user };
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        return { success: false, error: error.message };
    }
}

// Email Sign-In
export async function loginWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await syncUserToDatabase(result.user);
        return { success: true, user: result.user };
    } catch (error) {
        console.error("Email Sign-In Error:", error);
        return { success: false, error: error.message };
    }
}

// Email Sign-Up
export async function signupWithEmail(email, password, name) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (name && result.user) {
            await updateProfile(result.user, { displayName: name });
        }
        await syncUserToDatabase(result.user, { name });
        return { success: true, user: result.user };
    } catch (error) {
        console.error("Email Sign-Up Error:", error);
        return { success: false, error: error.message };
    }
}

// Sign Out
export async function logoutUser() {
    try {
        await signOut(auth);
        localStorage.removeItem('vectorizerUser');
        sessionStorage.clear();
        return { success: true };
    } catch (error) {
        console.error("Sign Out Error:", error);
        localStorage.removeItem('vectorizerUser');
        sessionStorage.clear();
        return { success: false, error: error.message };
    }
}

// Save Project Vector to Firestore Database
export async function saveProjectToFirestore(projectData) {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "Not authenticated" };
    try {
        const projRef = collection(db, "users", user.uid, "projects");
        const docRef = await addDoc(projRef, {
            ...projectData,
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (e) {
        console.error("Failed to save project to Firestore:", e);
        return { success: false, error: e.message };
    }
}

// Export globally for inline scripts
window.FirebaseService = {
    auth,
    db,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    logoutUser,
    syncUserToDatabase,
    saveProjectToFirestore,
    onAuthStateChanged
};
