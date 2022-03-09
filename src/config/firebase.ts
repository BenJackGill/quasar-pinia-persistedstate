// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAat4FCff5i2UXz65MxtGtG0DsvIj4WN78',
  authDomain: 'agentcake-app.firebaseapp.com',
  projectId: 'agentcake-app',
  storageBucket: 'agentcake-app.appspot.com',
  messagingSenderId: '626584447727',
  appId: '1:626584447727:web:7e2d5c525b00f6da0f091a',
  measurementId: 'G-X2JQRRYQV3',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

//Export modules
export const db = getFirestore(firebaseApp);
export const store = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp);
export const analytics = getAnalytics(firebaseApp);
export const timestamp = serverTimestamp();
