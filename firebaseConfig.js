// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
const firebaseConfig = {
  apiKey: "AIzaSyALcg6utMHov-wQwTfgqzUTSetnbd9AKFM",
  authDomain: "major-757a9.firebaseapp.com",
  databaseURL: "https://major-757a9-default-rtdb.firebaseio.com",
  projectId: "major-757a9",
  storageBucket: "major-757a9.appspot.com",
  messagingSenderId: "747490195955",
  appId: "1:747490195955:web:2c03724a375bf1b53bfa86",
  measurementId: "G-5HYBLCJM6Q"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };
const db=getDatabase(app)
export {db}
export const dbs = getFirestore(app);
