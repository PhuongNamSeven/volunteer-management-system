import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCDrTOLdzcsOc_xX2j1Je2I6KCarU1a57c",
  authDomain: "volunteer-management-sys-680d4.firebaseapp.com",
  databaseURL:"https://volunteer-management-sys-680d4-default-rtdb.firebaseio.com",
  projectId: "volunteer-management-sys-680d4",
  storageBucket: "volunteer-management-sys-680d4.firebasestorage.app",
  messagingSenderId: "729876125286",
  appId: "1:729876125286:web:26c0e250416a776d597fa7"
  
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);