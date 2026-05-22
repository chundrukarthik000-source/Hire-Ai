import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let auth = null;
let googleProvider = null;
let isMockAuth = true;

// Check if actual configuration has been provided
const isConfigValid = firebaseConfig.apiKey && 
                      firebaseConfig.apiKey !== "your_firebase_api_key" && 
                      firebaseConfig.apiKey.trim() !== "";

if (isConfigValid) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    isMockAuth = false;
    console.log("[Firebase Service] Live web client successfully initialized.");
  } catch (error) {
    console.error("[Firebase Service Error] Failed to initialize live SDK. Falling back to Mock Auth:", error);
    isMockAuth = true;
  }
} else {
  console.log("[Firebase Service] Missing API credentials. Defaulting to local Mock Authentication.");
}

export { auth, googleProvider, isMockAuth };
export default auth;
