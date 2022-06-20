//in nodejs  - BACK END(JS)
// require() example: const { ethers } = require("ethers");

// in front-end javascript you cant´t use require("") - FRONT END (JS)
// import("")

import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
withdrawButton.onclick = withdraw;
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.innerHTML = "Connected";
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }
}

async function getBalance() {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function fund(ethAmount) {
  console.log(`Funding with ${ethAmount}...`);
  ethAmount = document.getElementById("ethAmount").value;
  if (typeof window.ethereum !== "undefined") {
    //Provider / Connection to the blockchain (Metamask - Infura)
    //Signer / Wallet /someone with gas
    //Contract that we are interacting with
    //ABI and Address.
    const provider = new ethers.providers.Web3Provider(window.ethereum); // Get Metmask as Provider
    const signer = provider.getSigner(); // Get account in the provider (Account 1)
    const contract = new ethers.Contract(contractAddress, abi, signer); // Get the address contract and the ABI
    try {
      const transactionResponse = await contract.fund({
        //Try to use the fund function, if not catch error
        value: ethers.utils.parseEther(ethAmount),
      });
      await ListenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}

async function withdraw() {
  if (typeof window.ethereum != "undefined") {
    console.log(`withdrawing...`);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await ListenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}

function ListenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
