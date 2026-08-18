// Firebase web app config.
// Paste the values from Firebase console → Project settings → Your apps → SDK setup.
// These values are publishable (safe in client code); security is enforced by
// Firebase Auth + Firestore security rules.
//
// You can either fill the strings below, or set VITE_FIREBASE_* env vars.

export const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] ?? "",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] ?? "",
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] ?? "",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ?? "",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] ?? "",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain,
);
