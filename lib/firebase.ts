// Firebase initialization for the NLP Timeline app.
// This is a static-export Next.js app, so the SDK is initialized only in
// the browser. The config is intentionally public (Firebase web config is
// meant to be exposed) and trims the secret values into a single source of
// truth at lib/firebase-config.ts.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { firebaseConfig } from './firebase-config';

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

/**
 * Lazily initialize the Firebase app on the client. Safe to call multiple
 * times — uses getApps() guard so HMR doesn't double-init.
 */
export function getFirebaseApp(): FirebaseApp {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }
  app = initializeApp(firebaseConfig);
  return app;
}

/**
 * Lazily initialize Firebase Analytics. Returns null on browsers that
 * don't support it (e.g. older Safari, file://, browser-only environments
 * without measurement support).
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (analytics) return analytics;
  const supported = await isSupported();
  if (!supported) return null;
  analytics = getAnalytics(getFirebaseApp());
  return analytics;
}
