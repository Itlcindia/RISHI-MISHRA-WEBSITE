'use client';
import {
  signInWithEmailAndPassword,
  signOut,
  Auth,
} from 'firebase/auth';

export const emailSignIn = (auth: Auth, email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = (auth: Auth) => {
  return signOut(auth);
};
