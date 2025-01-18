import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
 apiKey: "",
  authDomain: "movie-app2-7ebf5.firebaseapp.com",
  projectId: "movie-app2-7ebf5",
  storageBucket: "movie-app2-7ebf5.firebasestorage.app",
  messagingSenderId: "1041398975162",
  appId: "1:1041398975162:web:90ceb90e65c09cd10f9083",
  measurementId: "G-4YWTW3CGLN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
//const analytics = getAnalytics(app);

export {auth, db, storage};