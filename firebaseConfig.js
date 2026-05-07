import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDarKM1y3fDp9aB03OgMumbRaijFLCZCTk",
  authDomain: "campus-projects-tracker.firebaseapp.com",
  projectId: "campus-projects-tracker",
  storageBucket: "campus-projects-tracker.appspot.com",
  messagingSenderId: "621406387744",
  appId: "1:621406387744:web:9ae1045e94fcd281810645",
  measurementId: "G-RXZFE74PC8"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);

export default app;