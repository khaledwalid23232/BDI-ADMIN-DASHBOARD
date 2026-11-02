import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { connectStorageEmulator, getStorage } from 'firebase/storage';

/**
 * Firebase web config. These values are public by design: they identify the
 * project, they do not grant access. Access is controlled by firestore.rules
 * and storage.rules. Restrict this API key to the app's domains in
 * Google Cloud Console > APIs & Services > Credentials.
 */
const firebaseConfig = {
  apiKey: 'AIzaSyDwwN5ljDGlxHact_4zbMnfU0A-5X2-Z5I',
  authDomain: 'eagle-eyes-6294d.firebaseapp.com',
  projectId: 'eagle-eyes-6294d',
  storageBucket: 'eagle-eyes-6294d.firebasestorage.app',
  messagingSenderId: '569109362866',
  appId: '1:569109362866:web:66d5e08323edf9efbff1ab',
};

const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

export const app = initializeApp(useEmulators ? { ...firebaseConfig, projectId: 'demo-bdi' } : firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { localCache: persistentLocalCache() });
export const storage = getStorage(app);

/** Region for Cloud Functions once they are added (phase 2). Same as Firestore. */
export const FUNCTIONS_REGION = 'europe-west1';

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}
