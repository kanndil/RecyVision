// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA4CXXxWMu0mgB2Oq6rIeg31QLXy8k4fAk",
    authDomain: "recyvision-demo.firebaseapp.com",
    projectId: "recyvision-demo",
    storageBucket: "recyvision-demo.firebasestorage.app",
    messagingSenderId: "311204943231",
    appId: "1:311204943231:web:ebfbf248b881b9bbd2f64a",
    measurementId: "G-9MDGR02FEN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);