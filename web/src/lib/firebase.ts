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
  apiKey: 'AIzaSyDQrWP6RZNGzD-SgWXxYgSOYTxRzzsoO20',
  authDomain: 'bdi-admin-dashboard.firebaseapp.com',
  projectId: 'bdi-admin-dashboard',
  storageBucket: 'bdi-admin-dashboard.firebasestorage.app',
  messagingSenderId: '881489339130',
  appId: '1:881489339130:web:ad1bfe2dd27417e83d5f43',
};

const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

export const app = initializeApp(useEmulators ? { ...firebaseConfig, projectId: 'demo-bdi' } : firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, { localCache: persistentLocalCache() });
export const storage = getStorage(app);

/** Region for Cloud Functions once they are added (phase 2). Same as Firestore. */
export const FUNCTIONS_REGION = 'europe-west2';

if (useEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}
