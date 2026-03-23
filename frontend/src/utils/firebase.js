import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let auth = null;
let googleProvider = null;

function isPlaceholder(value) {
    return !value || String(value).startsWith('YOUR_');
}

function ensureFirebaseAuth() {
    if (auth && googleProvider) {
        return { auth, googleProvider };
    }

    const missingKeys = Object.entries(firebaseConfig)
        .filter(([, value]) => isPlaceholder(value))
        .map(([key]) => key);

    if (missingKeys.length > 0) {
        const error = new Error(
            `Missing Firebase configuration values: ${missingKeys.join(', ')}`
        );
        error.code = 'firebase/missing-config';
        throw error;
    }

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    return { auth, googleProvider };
}

export const signInWithGoogle = async () => {
    try {
        const { auth: firebaseAuth, googleProvider: provider } = ensureFirebaseAuth();
        const result = await signInWithPopup(firebaseAuth, provider);
        const user = result.user;
        const idToken = await user.getIdToken();
        return { user, idToken };
    } catch (error) {
        console.error("Error signing in with Google:", error);
        throw error;
    }
};
