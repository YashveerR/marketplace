import * as functions from "firebase-functions";
import sendGridClient = require("@sendgrid/mail");

import admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.sendOrderStatus = functions.https.onCall((data, context) => {
  /*   const text = data.text;
  let text2: string = data.text;
  const uid = context.auth?.uid;
  console.log(text, text2, uid);
 */

  const dataToSend = JSON.parse(data.text);
  let recipientEmail = "";
  console.log("New Data coming in: ");
  console.log(
    dataToSend.recipientOrderNo,
    dataToSend.recipientId,
    dataToSend.orderS
  );

  const docRef = db
    .collection("users")
    .doc(dataToSend.recipientId)
    .get()
    .then((doc: any) => {
      recipientEmail = doc.data().email;
      console.log("Email address retrieved", recipientEmail);
      sendGridClient.setApiKey(functions.config().sendgrid.key);

      const senderEmail = "rentathing-noreply@rentathing.com";

      const sendGridTemplateId = "d-657ab9399ba7483d9ac798069de42279";

      //order status email must have:
      //order number, status changed to
      //message seller, message buyer
      //view orders
      //
      if (!recipientEmail || !dataToSend.recipientOrderNo) {
        console.error(
          new Error(
            "Missing emailAddress or order number on user document. Aborting."
          )
        );
        return;
      }

      const mailData = {
        to: recipientEmail,
        from: senderEmail,
        templateId: sendGridTemplateId,

        dynamic_template_data: {
          orderNo: dataToSend.recipientOrderNo,
          orderStatus: dataToSend.orderS,
          Sender_name: "Rent-a-Thing™",
        },
      };
      return sendGridClient.send(mailData);
    })
    .catch(() => {
      console.error(new Error("Error reading user Id for Email"));
      return;
    });

  console.log(docRef);
});

exports.sendNewChatAlert = functions.https.onCall((data) => {
  let recipientEmail = "";
  const dataToSend = JSON.parse(data.text);

  const docRef = db
    .collection("users")
    .doc(dataToSend.recipientId)
    .get()
    .then((doc: any) => {
      recipientEmail = doc.data().email;
      sendGridClient.setApiKey(functions.config().sendgrid.key);
      const sendGridTemplateId = "d-a39dac3cce63410782327193a1aa8545";
      const senderEmail = "rentathing-noreply@rentathing.com";

      if (!recipientEmail || !dataToSend.recipientOrderNo) {
        console.error(
          new Error(
            "Missing emailAddress or order number on user document. Aborting."
          )
        );
        return;
      }
      const mailData = {
        to: recipientEmail,
        from: senderEmail,
        templateId: sendGridTemplateId,

        dynamic_template_data: {
          orderNo: dataToSend.recipientOrderNo,
          itemName: dataToSend.itemName,
        },
      };
      return sendGridClient.send(mailData);
    })
    .catch(() => {
      console.error(new Error("Error reading user Id for Email"));
      return;
    });
  console.log(docRef);
});
