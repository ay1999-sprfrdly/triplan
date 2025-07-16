// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZS4ixn22x9VDj1njCR-Fxg73kSJY44VY",
  authDomain: "ay1999-spfrdly-triplan.firebaseapp.com",
  projectId: "ay1999-spfrdly-triplan",
  storageBucket: "ay1999-spfrdly-triplan.firebasestorage.app",
  messagingSenderId: "820004966430",
  appId: "1:820004966430:web:a5b882b6d82b92c702de0f",
  measurementId: "G-48M76HJYJ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);