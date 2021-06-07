const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyABF0uaswmr85Y_7HtWS4I7LO_H0n9-lHU",
    authDomain: "cybercitycomics-a9556.firebaseapp.com",
    databaseURL: "https://cybercitycomics-a9556-default-rtdb.firebaseio.com",
    projectId: "cybercitycomics-a9556",
    storageBucket: "cybercitycomics-a9556.appspot.com",
    messagingSenderId: "1085004577049",
    appId: "1:1085004577049:web:3db6e9e8299ffc2d8ded88",
    measurementId: "G-J8BYRN7WMZ"
  };

  const firebaseApp = firebase.initializeApp(firebaseConfig)
  const db = firebaseApp.firestore()
  const database = firebaseApp.database();

