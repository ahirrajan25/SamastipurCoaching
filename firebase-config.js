// Firebase console > Project settings > Your apps > Web app > SDK setup.
// Replace every placeholder with your Firebase web app config.
// Do NOT put service-account/private admin keys in this file.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC0EG7foQgTM8sR7M5ovKj1t8-XjDHp8I0",
  authDomain: "samastipurcoaching.firebaseapp.com",
  projectId: "samastipurcoaching",
  storageBucket: "samastipurcoaching.firebasestorage.app",
  messagingSenderId: "194073584385",
  appId: "1:194073584385:web:e69109a56305469121f100"
};

export const isFirebaseConfigured =
  firebaseConfig.apiKey !== "PASTE_API_KEY_HERE" &&
  firebaseConfig.projectId !== "PASTE_PROJECT_ID_HERE" &&
  Boolean(firebaseConfig.appId && firebaseConfig.appId !== "PASTE_APP_ID_HERE");

let app, db, auth;
if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
}
export { db, auth };
