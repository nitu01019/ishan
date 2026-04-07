import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured: boolean =
  typeof process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === "string" &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.length > 0;

function initFirebase(): FirebaseApp | null {
  if (!isFirebaseConfigured) {
    return null;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  return initializeApp(firebaseConfig);
}

const firebaseApp = initFirebase();

export const app: FirebaseApp | null = firebaseApp;
export const db: Firestore | null = firebaseApp
  ? getFirestore(firebaseApp)
  : null;
export const storage: FirebaseStorage | null = firebaseApp
  ? getStorage(firebaseApp)
  : null;
