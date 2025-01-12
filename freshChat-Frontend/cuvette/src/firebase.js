import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVu0zhmDTb4A4unM2ZSlRP3V_s0NMbDpo",
  authDomain: "cuvette-task.firebaseapp.com",
  projectId: "cuvette-task",
  storageBucket: "cuvette-task.appspot.com",  
  messagingSenderId: "197753857524",
  appId: "1:197753857524:web:14c63d6889b912352445a1",
  measurementId: "G-43MCG39K67"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
