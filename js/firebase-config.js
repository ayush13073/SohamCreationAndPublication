import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4vJNC8QZsVVwM4Rcr2h7HcYDq--Oj1MY",
  authDomain: "sohamcreationandpublication.firebaseapp.com",
  projectId: "sohamcreationandpublication",
  storageBucket: "sohamcreationandpublication.firebasestorage.app",
  messagingSenderId: "173644617844",
  appId: "1:173644617844:web:3e1cc7d29388530d791921",
  measurementId: "G-5X30PL126R"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);