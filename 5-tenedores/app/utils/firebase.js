import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBh_-7dydjKPjtw_gkuXRamBvxmOiO8UgU",
  authDomain: "tenedores-75a6a.firebaseapp.com",
  databaseURL: "https://tenedores-75a6a.firebaseio.com",
  projectId: "tenedores-75a6a",
  storageBucket: "tenedores-75a6a.appspot.com",
  messagingSenderId: "772370505484",
  appId: "1:772370505484:web:953b071043f1725eaef329",
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
