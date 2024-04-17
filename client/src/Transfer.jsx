import { useState } from "react";
import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak"
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import * as secp from "ethereum-cryptography/secp256k1";


//with the transfer function we are transferring an amount to a wallet with an address and we are sending a post request 
//which includes the sender: their address which is their public address the receiver and the amount sent
//to make this more secure we want to include a digital signature as well which we do by signing a message 
//To use the ECDSA the first step is to hash the message before applying the signature algo

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

 // Step 1 hash the message - creating a hash message function which returns the keccak256 hash of the message 
  const hashMessage = (message) => keccak256(utf8ToBytes(message));
  //create a signMessage function that takes in the hashed message and private key and returns a signature
  const signMessage = (msgHash) => secp.secp256k1.sign(msgHash, privateKey);

  async function transfer(evt) {
    evt.preventDefault();
    //create a message to sign
    const message = `transfer ${sendAmount} to ${recipient}`;
    //create a variable called msgHash which stores the hashed message
    const msgHash = hashMessage(message);
    console.log("Message Hash:", toHex(msgHash), typeof(msgHash));
    // create a variable that takes in an arguement msgHash which is signed and attributed to the signature
    const signature = signMessage(msgHash);
    const {r,s, recovery} = signature;
    const signatureData = JSON.stringify({
      r: r.toString(), //converts bigInt to string
      s: s.toString(), //converts bigInt to string 
      recovery
    });
    console.log("Signature:", signature, typeof(signature));

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: signatureData,
        message
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
