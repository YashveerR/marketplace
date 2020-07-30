import app from "firebase/app";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import FirebaseContext, { withFirebase } from "./context";

const config = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_DATABASE_URL,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
};

class Firebase {
  db: any;
  auth: any;
  emailAuthProvider: typeof app.auth.EmailAuthProvider;
  fieldValue: typeof app.firestore.FieldValue;
  googleProvider: app.auth.GoogleAuthProvider;
  facebookProvider: app.auth.FacebookAuthProvider;
  twitterProvider: app.auth.TwitterAuthProvider;

  constructor() {
    app.initializeApp(config);

    this.fieldValue = app.firestore.FieldValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;

    console.log(this.emailAuthProvider);
    /* Firebase APIs */

    this.auth = app.auth();
    this.db = app.firestore();

    this.googleProvider = new app.auth.GoogleAuthProvider();
    this.facebookProvider = new app.auth.FacebookAuthProvider();
    this.twitterProvider = new app.auth.TwitterAuthProvider();
  }

  // *** Auth API ***

  doReadSingleDoc(uId: any) {
    return this.db.collection("users").doc(uId).get();
  }
  doCreateUserWithEmailAndPassword(email: any, password: any) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }

  doSignInWithEmailAndPassword = (email: any, password: any) =>
    firebase.auth().signInWithEmailAndPassword(email, password);

  doSignInWithGoogle = () =>
    firebase.auth().signInWithPopup(this.googleProvider);

  doSignInWithFacebook = () =>
    firebase.auth().signInWithPopup(this.facebookProvider);

  doSignInWithTwitter = () =>
    firebase.auth().signInWithPopup(this.twitterProvider);

  doSignOut() {
    return firebase.auth().signOut();
  }

  doPasswordReset(email: any) {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  doPasswordUpdate(password: any) {
    return firebase.auth().currentUser?.updatePassword(password);
  }

  doUpdateUser(
    recID: any,
    nameP: any,
    lastnameP: any,
    emailP: any,
    numberP: any,
    addressP: any,
    suburbP: any,
    provinceP: any,
    areacodeP: any,
    termsP: any
  ) {
    this.db.collection("users").doc(recID).set(
      {
        name: nameP,
        lastname: lastnameP,
        email: emailP,
        number: numberP,
        address: addressP,
        suburb: suburbP,
        province: provinceP,
        areacode: areacodeP,
        terms: termsP,
      },
      { merge: true }
    );
  }

  doSendEmailVerification = () =>
    firebase.auth().currentUser?.sendEmailVerification({
      url: process.env.REACT_APP_CONFIRMATION_EMAIL_REDIRECT || "",
    });

  onAuthUserListener(next: any, fallback: any) {
    return firebase.auth().onAuthStateChanged((authUser: any) => {
      if (authUser) {
        this.user(authUser.uid)
          .get()
          .then((snapshot: any) => {
            const dbUser = snapshot.data();

            // default empty roles

            // merge auth and db user
            authUser = {
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              providerData: authUser.providerData,
              ...dbUser,
            };

            next(authUser);
            console.log("after user");
          });
      } else {
        console.log("falling back to nothingness");
        fallback();
      }
    });
  }

  user = (uid: any) => this.db.doc(`users/${uid}`);

  users = () => this.db.collection("users");
}

export default Firebase;

export { FirebaseContext, withFirebase };
