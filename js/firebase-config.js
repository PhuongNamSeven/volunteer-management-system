import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCDrTOLdzcsOc_xX2j1Je2I6KCarU1a57c",
  authDomain: "volunteer-management-sys-680d4.firebaseapp.com",
  projectId: "volunteer-management-sys-680d4",
  storageBucket: "volunteer-management-sys-680d4.firebasestorage.app",
  messagingSenderId: "729876125286",
  appId: "1:729876125286:web:26c0e250416a776d597fa7"
  
};

const app = initializeApp(firebaseConfig);

export default app;