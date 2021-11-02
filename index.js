const bodyParser = require("body-parser");
const express = require("express");
const request = require("request");
const Blockchain = require("./server/blockchain");
const PubSub = require("./server/app/pubsub");
const crypto = require("crypto");
const Ownedblock = require("./database");

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });
const algorithm = "aes-256-cbc";

app.use(express.static(__dirname + "/public"));

const DEFAULT_PORT = 3000;
const ROOT_NODE_ADDRESS = "http://localhost:" + DEFAULT_PORT;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/view", (req, res) => {
  res.sendFile(__dirname + "/public/view.html");
});

app.get("/add", (req, res) => {
  res.sendFile(__dirname + "/public/add.html");
});

app.get("/start", (req, res) => {
  res.sendFile(__dirname + "/public/start.html");
});

app.get("/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/view", (req, res) => {
  var masID = req.body.masID;
  var masPASS = req.body.masPASS;

  var finalData = [];

  Ownedblock.findOne({ username: masID }, function (err, docs) {
    if (err) {
      console.log(err);
    } else if (docs == null) {
      res.send("No Data Available");
    } else {
      docs.myblocks.forEach((element) => {
        var tempData = [];

        var temp = blockchain.chain[element].data;

        var IV = temp[3];
        var TITLE = temp[0];
        var USERNAME = decryptData(masPASS, temp[1], IV);
        var PASSWORD = decryptData(masPASS, temp[2], IV);

        tempData.push(TITLE, USERNAME, PASSWORD);

        finalData.push(tempData);
      });
      res.send(finalData);
    }
  });
});

app.post("/add", (req, res) => {
  var masterUsername = req.body.masterusername;

  var initVector = makeString(16);

  var masterKey = req.body.masterkey;

  const finalUsername = encryptData(masterKey, req.body.username, initVector);

  const finalPassword = encryptData(masterKey, req.body.password, initVector);

  var data = [req.body.title, finalUsername, finalPassword, initVector];

  blockchain.addBlock({ data });

  pubsub.broadcastChain();

  var { index } = blockchain.chain[blockchain.chain.length - 1];

  Ownedblock.findOne({ username: masterUsername }, function (err, docs) {
    if (err) {
      console.log(err);
    } else if (docs == null) {
      console.log("MAKING NEW BLOCK");
      const myblock = new Ownedblock({
        username: masterUsername,
        myblocks: index,
      });

      myblock.save();
    } else {
      docs.myblocks.push(index);
      docs.save();
    }
  });

  res.sendFile(__dirname + "/public/successful.html");
});

const makeString = (length) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const encryptData = (Securitykey, message, initVector) => {
  const cipher = crypto.createCipheriv(algorithm, Securitykey, initVector);

  let encryptedData = cipher.update(message, "utf-8", "hex");

  encryptedData += cipher.final("hex");

  return encryptedData;
};

const decryptData = (Securitykey, message, initVector) => {
  const decipher = crypto.createDecipheriv(algorithm, Securitykey, initVector);
  try {
    let decryptedData = decipher.update(message, "hex", "utf-8");

    decryptedData += decipher.final("utf8");
    return decryptedData;
  } catch (error) {
    return "Error Decrypting";
  }
};

const syncChains = () => {
  request(
    { url: ROOT_NODE_ADDRESS + "/api/blocks" },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        const rootChain = JSON.parse(body);

        console.log("replace chain on a sync with " + rootChain);

        blockchain.replaceChain(rootChain);
      }
    }
  );
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === "true") {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
  console.log("listening at localhost:" + PORT);

  if (PORT !== DEFAULT_PORT) {
    syncChains();
  }
});
