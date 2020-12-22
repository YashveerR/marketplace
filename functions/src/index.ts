import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import sendGridClient = require("@sendgrid/mail");
//import { resolve } from "url";

const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const dns = require("dns");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();

const sharp = require("sharp");
const fs = require("fs-extra");
const { tmpdir } = require("os");
const { dirname, join } = require("path");

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
      const senderEmail = "codenameyash@gmail.com";

      console.log(
        "READY TO SEND: ",
        recipientEmail,
        senderEmail,
        sendGridTemplateId,
        dataToSend.recipientOrderNo,
        dataToSend.itemName
      );

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
          user: "Yash",
          orderId: dataToSend.recipientOrderNo,
          item: dataToSend.itemName,
        },
      };
      return sendGridClient.send(mailData);
    })
    .catch((error: any) => {
      console.error(new Error(error));
      return;
    });
  console.log(docRef);
});

exports.resizeImg = functions.https.onCall(async (data) => {
  //const clientData = JSON.parse(data.text);
  console.log(data.text.path);
  let clientData = data.text.path;

  const bucket = admin
    .storage()
    .bucket("gs://marketplace-rent-a-thing.appspot.com"); // dangers of hard coding this thing in meow....

  clientData.forEach((filezPath: string) => {
    console.log("in the loop: ", filezPath);
    const filePath = filezPath;
    const fileName = filePath.split("/").pop();
    const bucketDir = dirname(filePath);
    const workingDir = join(tmpdir(), "resize");
    const tmpFilePath = join(workingDir, "source.png");

    console.log(filePath, fileName, bucketDir, tmpFilePath);

    const remoteFile = bucket.file(filePath);
    return remoteFile.getMetadata().then(async ([metadata]) => {
      console.log(metadata.metadata.firebaseStorageDownloadTokens);
      await fs.ensureDir(workingDir);
      await remoteFile.download({ destination: tmpFilePath });

      const ext = fileName?.split(".").pop();
      const imgName = fileName?.replace(`.${ext}`, "");
      const newImgName = `${imgName}@s_${100}.${ext}`;
      const imgPath = join(workingDir, newImgName);
      await sharp(tmpFilePath)
        .resize({ width: 640, height: 480 })
        .toFile(imgPath)

        .then((dat: any) => {
          console.log("sharp succeeded");
        })
        .catch((err: any) => {
          console.log("sharp failed");
        });

      remoteFile
        .delete()
        .then((dat: any) => {
          console.log("deletion of file succeeded");
        })
        .catch((err: any) => {
          console.log("deletion of file failed");
        }); //remove the original file
      return bucket.upload(imgPath, {
        metadata: {
          metadata: {
            firebaseStorageDownloadTokens:
              metadata.metadata.firebaseStorageDownloadTokens, //can generate a new uuid4 here or use the existing one and remove the file.
            optimized: true,
          },
        },
        destination: filePath,
      });
    });
  });
});
/* .runWith({ memory: "2GB", timeoutSeconds: 120 })
  .storage.object()
  .onFinalize(handler);

async function handler(object: any) {
  const bucket = admin.storage().bucket(object.bucket);
  const filePath = object.name;
  const fileName = filePath.split("/").pop();
  const bucketDir = dirname(filePath);

  const workingDir = join(tmpdir(), "resize");
  const tmpFilePath = join(workingDir, "source.png");

  console.log(bucket, filePath, fileName, bucketDir);

  if (fileName.includes("@s_") || !object.contentType.includes("image")) {
    return false;
  }

  await fs.ensureDir(workingDir);
  await bucket.file(filePath).download({ destination: tmpFilePath });

  const sizes = [100];

  const uploadPromises = sizes.map(async (size: any) => {
    const ext = fileName.split(".").pop();
    const imgName = fileName.replace(`.${ext}`, "");
    const newImgName = `${imgName}@s_${size}.${ext}`;
    const imgPath = join(workingDir, newImgName);
    await sharp(tmpFilePath).resize({ width: size }).toFile(imgPath);

    return bucket.upload(imgPath, { destination: join(bucketDir, newImgName) });
  });

  await Promise.all(uploadPromises);
  return fs.remove(workingDir);
}
 */

const app = express();

const testingMode = true;
const pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";
const passPhrase = functions.config().payfastpassphrase.key;

console.log("WHAT IS THIS MAGIC: ", passPhrase);
// serve static assets normally
app.use(express.static(path.join(__dirname, "../build")));
app.use(bodyParser.urlencoded({ extended: true }));
console.log(path.join(__dirname, "../build"));
/*
const path = require('path')app.get('*', (req, res)=>{  res.sendFile(path.join(__dirname, '../build/index.html'));})
*/
// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get("*", function (request: any, response: any) {
  response.sendFile(path.join(__dirname, "../build/index.html"));
});

app.post("/webhook", async (req: any, res: any) => {
  res.sendStatus(200); // Responding is important
  console.log(req.body); // Call your action on the request here
  const pfData = JSON.parse(JSON.stringify(req.body));

  let pfParamString = "";
  for (let key in pfData) {
    if (pfData.hasOwnProperty(key) && key !== "signature") {
      pfParamString += `${key}=${encodeURIComponent(pfData[key].trim()).replace(
        /%20/g,
        "+"
      )}&`;
    }
  }

  // Remove last ampersand
  pfParamString = pfParamString.slice(0, -1);

  const check1 = pfValidSignature(pfData, pfParamString, passPhrase);
  const check2 = await pfValidIP(req);
  const check4 = await pfValidServerConfirmation(pfHost, pfParamString);
  if (check1 && check2 && check4) {
    console.log("Payment is successful", check1, check2, check4);
    console.log(pfData["m_payment_id"]);
    console.log(cityRef(pfData["custom_str1"], pfData["m_payment_id"]));
  } else {
    // Some checks have failed, check payment manually and log for investigation
    console.log("Payment not successful", check1, check2, check4);
    console.log(pfData["m_payment_id"]);
    //console.log(cityRef(pfData[]));
  }
});

const cityRef = async (docId: any, id: any) => {
  db.collection("orders")
    .doc(docId)
    .collection("myOrders")
    .doc(id)
    .set({ paymentStat: "complete" }, { merge: true })
    .then(() => {
      console.log("Wrote to DB successfully");
    });
};

const pfValidSignature = (
  pfData: any,
  pfParamString: any,
  pfPassphrase: any
) => {
  // Calculate security signature
  //let tempParamString = "";
  if (pfPassphrase !== null) {
    pfParamString += `&passphrase=${encodeURIComponent(
      pfPassphrase.trim()
    ).replace(/%20/g, "+")}`;
  }

  const signature = crypto
    .createHash("md5")
    .update(pfParamString)
    .digest("hex");
  return pfData["signature"] === signature;
};

async function ipLookup(domain: any) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, { all: true }, (err: any, address: any, family: any) => {
      if (err) {
        reject(err);
      } else {
        const addressIps = address.map(function (item: any) {
          return item.address;
        });
        resolve(addressIps);
      }
    });
  });
}

const pfValidIP = async (req: any) => {
  const validHosts = [
    "www.payfast.co.za",
    "sandbox.payfast.co.za",
    "w1w.payfast.co.za",
    "w2w.payfast.co.za",
  ];

  let q: any[] = [];
  let res = false;
  let validIps;
  let p;

  const pfIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    console.log("WTF is happening here!!!!");
    (async () => {
      await Promise.all(
        validHosts.map(async (k) => {
          console.log("attempting to map k", k);
          q.push(await ipLookup(k));
        })
      )
        .then(() => {
          p = q;
          validIps = [...p];

          if (
            validIps.find((obj: string | any[]) => {
              return obj.includes(pfIp);
            }) !== undefined
          ) {
            console.log("We have found a valid IP address!");
            res = true;
          }
        })
        .catch((error) => {
          console.log("There is an error here", error);
        });
      return res;
    })();
  } catch (err) {
    console.log("are we getting into the prmise? ");
    console.error(err);
  }
};

const pfValidServerConfirmation = async (
  pfHost: string,
  pfParamString: string
) => {
  const result = await axios
    .post(`https://${pfHost}/eng/query/validate`, pfParamString)
    .then((res: { data: any }) => {
      return res.data;
    })
    .catch((error: any) => {
      console.error(error);
    });
  return result === "VALID";
};

exports.webreq = functions.https.onRequest(app);
