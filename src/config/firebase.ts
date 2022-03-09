// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDqFZ0YdAaDhp6ZdGy49u4RdVY7yKXMNt0',
  authDomain: 'testing-b3185.firebaseapp.com',
  projectId: 'testing-b3185',
  storageBucket: 'testing-b3185.appspot.com',
  messagingSenderId: '178176364982',
  appId: '1:178176364982:web:590b057be5552864d97117',
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

//Export modules
export const db = getFirestore(firebaseApp);
export const store = getStorage(firebaseApp);
export const auth = getAuth(firebaseApp);
export const analytics = getAnalytics(firebaseApp);
export const timestamp = serverTimestamp();
