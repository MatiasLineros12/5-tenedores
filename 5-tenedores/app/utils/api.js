// esta api se desarrollo para ser llamada cada vez que se necesite reautenticar al usuario

import * as firebase from "firebase";

export function reauthenticate(password) {
  const user = firebase.auth().currentUser;
  const credentials = firebase.auth.EmailAuthProvider.credential(
    user.email,
    password
  );
  return user.reauthenticateWithCredential(credentials);
}