import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

// Public client configuration for the SCA Alumni Firebase project.
// Access to data is controlled by firestore.rules, not by keeping these values secret.
const firebaseConfig = {
  apiKey: 'AIzaSyClSDMmOmAdnBKU8LQkN0EbvERNt6tMIac',
  authDomain: 'sca-alumni-d125a.firebaseapp.com',
  projectId: 'sca-alumni-d125a',
  storageBucket: 'sca-alumni-d125a.firebasestorage.app',
  messagingSenderId: '61474011341',
  appId: '1:61474011341:web:3c35a16b634c49184d5184',
};

const firstInit = getApps().length === 0;
export const app = firstInit ? initializeApp(firebaseConfig) : getApp();

function createAuth() {
  if (Platform.OS === 'web' || !firstInit) return FirebaseAuth.getAuth(app);
  // On phones, keep people signed in between launches. The React Native build of
  // firebase/auth exports getReactNativePersistence; the web typings do not list it.
  const getPersistence = (FirebaseAuth as unknown as {
    getReactNativePersistence?: (storage: unknown) => FirebaseAuth.Persistence;
  }).getReactNativePersistence;
  if (!getPersistence) return FirebaseAuth.getAuth(app);
  return FirebaseAuth.initializeAuth(app, { persistence: getPersistence(AsyncStorage) });
}

export const auth = createAuth();
export const db = getFirestore(app);

/** People who run the app. Must match the list in firestore.rules. */
export const ADMIN_EMAILS = ['marc@scaffoldworks.ai'];
