import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type Storage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initializeFirebaseServices() {
  const isFirebaseConfigured =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId;

  if (!isFirebaseConfigured) {
    console.warn(
      'Firebase config is incomplete. Firebase services will be disabled.'
    );
    return { db: undefined, auth: undefined, storage: undefined };
  }

  try {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);
    const auth = getAuth(app);
    const storage = getStorage(app);
    return { db, auth, storage };
  } catch (e) {
    console.error('Error initializing Firebase. Check your configuration.', e);
    return { db: undefined, auth: undefined, storage: undefined };
  }
}

const { db, auth, storage } = initializeFirebaseServices();

export { db, auth, storage };
