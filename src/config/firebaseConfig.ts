// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgnKGVZog78SxLzLS090FvZ8gxy6mfHZ4",
  authDomain: "vintagevilla-c5a56.firebaseapp.com",
  projectId: "vintagevilla-c5a56",
  storageBucket: "vintagevilla-c5a56.firebasestorage.app",
  messagingSenderId: "676527874018",
  appId: "1:676527874018:web:a791894a344f629f2723bb",
  measurementId: "G-EBJ6XPP26R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);