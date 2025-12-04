// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-YJKe08o6tIr-_liatimGcMEk0bmYydg",
  authDomain: "ai-task-manager-a987d.firebaseapp.com",
  projectId: "ai-task-manager-a987d",
  storageBucket: "ai-task-manager-a987d.firebasestorage.app",
  messagingSenderId: "689226315502",
  appId: "1:689226315502:web:bbb19235a7b603caaca5ff"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };





