const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());
//21ec875225c913c9e911da9097d5290598016d4125f740c1a57fd50c5ccf4a4b
//39801833c0164370e316401b39cb8dfd83954e5cfd7dc9cb65660c198ba0caf3
//ff2cd0f31807c09af692c079b86b8371c1ec9a3b46f72982a55e255bb08b983b

const balances = {
  "0222aab3a358a99acf40835ce0ee487d0cb8aa7af8450833c7d238dc1a18587e29": 100,
  "033f7953f8385d7805ad47fe4bd580f67102817b71dd6f537596374d4dce05d00f": 50,
  "022fab682c4d0f29b2f5d9872299164d1b02c33b6452066cd482a5c388c51fe4a8": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  //TODO: get a signature from the client side application
  //recover the public address from the signature

  const { sender, recipient, amount, message, signature} = req.body;
  
  const parsedSignature = JSON.parse(signature);
  const {r,s,recovery} = parsedSignature;

  const sig = {
    ...parsedSignature,
    r: BigInt(parsedSignature.r),
    s: BigInt(parsedSignature.s)
  }
  console.log("parsedSignature",sig);
  const hashMessage = keccak256(utf8ToBytes(message));
  const isValid = secp.secp256k1.verify(sig,hashMessage,sender) === true;

  if(!isValid){
     res.status(400).send({message: "bad signature"})
  }



  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
