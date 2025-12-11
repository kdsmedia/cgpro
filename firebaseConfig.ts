import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAQFsFnz69VfZqD3NP1umgTg45hYLRMS1w",
  authDomain: "laci-222f3.firebaseapp.com",
  projectId: "laci-222f3",
  storageBucket: "laci-222f3.firebasestorage.app",
  messagingSenderId: "827067069702",
  appId: "1:827067069702:web:d36b98018f7bd18faf1a87",
  measurementId: "G-E1559HWMC0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);