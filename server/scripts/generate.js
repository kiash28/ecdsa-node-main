const secp = require("ethereum-cryptography/secp256k1");
const {toHex} = require("ethereum-cryptography/utils");

//generate private key
const privateKey = secp.secp256k1.utils.randomPrivateKey();

console.log("privateKey", toHex(privateKey));

const PublicKey = secp.secp256k1.getPublicKey(privateKey);

console.log("Public Key", toHex(PublicKey) );