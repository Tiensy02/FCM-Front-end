// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app" ;   
import { getMessaging } from "firebase/messaging"; 
import {getDatabase} from 'firebase/database'
import { getStorage } from "firebase/storage";

const firebaseConfig = { 
  apiKey : "AIzaSyCs-HVXoPyNvgtCTSzbe_kEIrf80DDKwd8" , 
  authDomain : "aws-combine.firebaseapp.com" , 
  projectId : "aws-combine" , 
  storageBucket : "aws-combine.appspot.com" , 
  messagingSenderId : "277427664559" , 
  appId : "1:277427664559:web:d6f37cc6a72d5cfe17465a" , 
  measurementId : "G-TBSQM3JZGQ",
  databaseURL: "https://aws-combine-default-rtdb.asia-southeast1.firebasedatabase.app"
};
// Initialize Firebase
const app = initializeApp ( firebaseConfig );
const messaging = getMessaging(app)
const dbFirebase = getDatabase()
const storage = getStorage(app)
export default app;
export {messaging,firebaseConfig,dbFirebase,storage};