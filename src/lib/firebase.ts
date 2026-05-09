// ============================================================
// NomadIQ – Firebase Configuration & Helpers
// ============================================================

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import type { NomadUser, Trip, TripAlert, UserPreferences } from './types';

// ---- Firebase Init ----
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let analytics: Analytics;

// Allow runtime configuration for environments where NEXT_PUBLIC variables are not baked in
const getInitialConfig = () => {
  if (typeof window !== 'undefined' && (window as any).__NOMADIQ_CONFIG__?.firebase) {
    return (window as any).__NOMADIQ_CONFIG__.firebase;
  }
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };
};

const runtimeConfig = getInitialConfig();

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(runtimeConfig) : getApps()[0];
    
    // Initialize Analytics only in the browser
    if (typeof window !== 'undefined') {
      isSupported().then((yes) => {
        if (yes) analytics = getAnalytics(app);
      });
    }
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

// ---- Auth Helpers ----

export async function signInWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(getFirebaseAuth(), provider);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

// ---- User CRUD ----

export async function createOrUpdateUser(
  user: User,
  preferences?: Partial<UserPreferences>
): Promise<void> {
  const userRef = doc(getDb(), 'users', user.uid);
  const existing = await getDoc(userRef);

  const defaultPreferences: UserPreferences = {
    transport: 'public-transit',
    diet: [],
    pace: 'moderate',
    accessibility: false,
    budgetPerDay: 100,
    interests: [],
  };

  if (!existing.exists()) {
    const userData: NomadUser = {
      uid: user.uid,
      displayName: user.displayName || 'Nomad',
      email: user.email || '',
      photoURL: user.photoURL || undefined,
      preferences: { ...defaultPreferences, ...preferences },
      createdAt: new Date().toISOString(),
    };
    await setDoc(userRef, userData);
  } else if (preferences) {
    await updateDoc(userRef, {
      preferences: { ...existing.data().preferences, ...preferences },
    });
  }
}

export async function getUserPreferences(uid: string): Promise<UserPreferences | null> {
  const userRef = doc(getDb(), 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data() as NomadUser).preferences : null;
}

// ---- Trip CRUD ----

export async function saveTrip(trip: Trip): Promise<void> {
  const tripRef = doc(getDb(), 'trips', trip.id);
  await setDoc(tripRef, { ...trip, updatedAt: new Date().toISOString() });
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  const tripRef = doc(getDb(), 'trips', tripId);
  const snap = await getDoc(tripRef);
  return snap.exists() ? (snap.data() as Trip) : null;
}

export async function getUserTrips(uid: string): Promise<Trip[]> {
  const q = query(
    collection(getDb(), 'trips'),
    where('ownerId', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Trip);
}

export function subscribeTripUpdates(tripId: string, callback: (trip: Trip) => void) {
  const tripRef = doc(getDb(), 'trips', tripId);
  return onSnapshot(tripRef, (snap) => {
    if (snap.exists()) callback(snap.data() as Trip);
  });
}

// ---- Alerts ----

export async function createAlert(alert: TripAlert): Promise<void> {
  const alertRef = doc(getDb(), 'alerts', alert.id);
  await setDoc(alertRef, alert);
}

export function subscribeTripAlerts(tripId: string, callback: (alerts: TripAlert[]) => void) {
  const q = query(
    collection(getDb(), 'alerts'),
    where('tripId', '==', tripId),
    where('status', '==', 'pending')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => d.data() as TripAlert));
  });
}
