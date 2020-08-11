import app from "firebase/app";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/firebase-storage";
import { v4 as uuidv4 } from "uuid";

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
  store: any;
  emailAuthProvider: typeof app.auth.EmailAuthProvider;
  fieldValue: typeof app.firestore.FieldValue;
  googleProvider: app.auth.GoogleAuthProvider;
  facebookProvider: app.auth.FacebookAuthProvider;
  twitterProvider: app.auth.TwitterAuthProvider;
  callBack: any;

  constructor() {
    app.initializeApp(config);

    this.fieldValue = app.firestore.FieldValue;
    this.emailAuthProvider = app.auth.EmailAuthProvider;

    console.log(this.emailAuthProvider);
    /* Firebase APIs */

    this.auth = app.auth();
    this.db = app.firestore();
    this.store = app.storage();

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

  async createImages(image: any, uId: any, itemName: any, itemCat: any) {
    var retImageArr: any = [];
    const storageRef = this.store.ref();
    const metadata = {
      customMetadata: {
        itemName: itemName,
        itemCat: itemCat,
      },
    };
    return new Promise(function (resolve, reject) {
      if (image === "") {
        retImageArr.push("");

        resolve(retImageArr);
      } else {
        let uploadTask = storageRef
          .child("itemImage/" + uId + "/" + uuidv4())
          .put(image, metadata);
        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on(
          firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
          function (snapshot: any) {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case firebase.storage.TaskState.PAUSED: // or 'paused'
                //console.log("Upload is paused");
                break;
              case firebase.storage.TaskState.RUNNING: // or 'running'
                // console.log("Upload is running");
                break;
            }
          },
          function (error: any) {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case "storage/unauthorized":
                // User doesn't have permission to access the object
                reject("storage/unauthorized");
                break;

              case "storage/canceled":
                // User canceled the upload
                reject("storage/canceled");
                break;

              case "storage/unknown":
                // Unknown error occurred, inspect error.serverResponse
                reject("storage/unknown");
                break;
            }
          },
          function () {
            // Upload completed successfully, now we can get the download URL
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then(function (downloadURL: any) {
                //console.log("File available at", downloadURL);
                retImageArr.push(downloadURL);

                resolve(retImageArr);
              });
          }
        );
      }
    });
  }
  createUserItem(
    uId: any,
    itemTitle: any,
    itemDesc: any,
    itemPrice: any,
    itemCategory: any,
    itemStatus: any,
    imgArr: any
  ) {
    return this.db.collection("items").doc().set(
      {
        author: uId,
        Title: itemTitle,
        Desc: itemDesc,
        Price: itemPrice,
        Cat: itemCategory,
        Status: itemStatus,
        ImgLink0: imgArr[0],
        ImgLink1: imgArr[1],
        ImgLink2: imgArr[2],
      },
      { merge: true }
    );
  }

  updateUserItem(
    docId: any,
    itemTitle: any,
    itemDesc: any,
    itemPrice: any,
    itemCategory: any,
    itemStatus: any,
    imgArr: any
  ) {
    return this.db.collection("items").doc(docId).set(
      {
        Title: itemTitle,
        Desc: itemDesc,
        Price: itemPrice,
        Cat: itemCategory,
        Status: itemStatus,
        ImgLink0: imgArr[0],
        ImgLink1: imgArr[1],
        ImgLink2: imgArr[2],
      },
      { merge: true }
    );
  }

  readUserItems(uId: any) {
    return this.db.collection("items").where("author", "==", uId).get();
  }

  readUserItem(docId: any) {
    return this.db.collection("items").doc(docId).get();
  }

  doUnsubListener() {
    this.callBack();
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
