const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const dns = require("dns");
const axios = require("axios");
var admin = require("firebase-admin");

var serviceAccount = require("./marketplace-rent-a-thing-f4dd07cddd47.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://marketplace-rent-a-thing.firebaseio.com",
});

const db = admin.firestore();

const port = process.env.PORT || 8080;
const app = express();

const testingMode = true;
const pfHost = testingMode ? "sandbox.payfast.co.za" : "www.payfast.co.za";
const passPhrase = process.env.REACT_APP_PAYFAST_PASSPHRASE;
// serve static assets normally
app.use(express.static(path.join(__dirname, "../build")));
app.use(bodyParser.urlencoded({ extended: true }));
console.log(path.join(__dirname, "../build"));
/*
const path = require('path')app.get('*', (req, res)=>{  res.sendFile(path.join(__dirname, '../build/index.html'));})
*/
// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get("*", function (request, response) {
  response.sendFile(path.join(__dirname, "../build/index.html"));
});

app.post("/webhook", async (req, res) => {
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

const cityRef = async (docId, id) => {
  db.collection("orders")
    .doc(docId)
    .collection("myOrders")
    .doc(id)
    .set({ paymentStat: "complete" }, { merge: true })
    .then(() => {
      console.log("Wrote to DB successfully");
    });
};

const pfValidSignature = (pfData, pfParamString, pfPassphrase = null) => {
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

async function ipLookup(domain) {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, { all: true }, (err, address, family) => {
      if (err) {
        reject(err);
      } else {
        const addressIps = address.map(function (item) {
          return item.address;
        });
        resolve(addressIps);
      }
    });
  });
}

const pfValidIP = async (req) => {
  const validHosts = [
    "www.payfast.co.za",
    "sandbox.payfast.co.za",
    "w1w.payfast.co.za",
    "w2w.payfast.co.za",
  ];

  let validIps = [];
  const pfIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    for (let key in validHosts) {
      const ips = await ipLookup(validHosts[key]);
      validIps = [...validIps, ...ips];
    }
  } catch (err) {
    console.error(err);
  }

  const uniqueIps = [...new Set(validIps)];

  if (uniqueIps.includes(pfIp)) {
    return true;
  }
  return false;
};

const pfValidServerConfirmation = async (pfHost, pfParamString) => {
  const result = await axios
    .post(`https://${pfHost}/eng/query/validate`, pfParamString)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.error(error);
    });
  return result === "VALID";
};

app.listen(port);
console.log("server started on port " + port);
