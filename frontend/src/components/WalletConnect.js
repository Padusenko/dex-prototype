import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const WalletConnect = ({ onConnected }) => {
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        onConnected(accounts[0]);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        onConnected(accounts[0]);
      } catch (err) {
        console.error("User rejected connection:", err);
      }
    } else {
      alert("Please install MetaMask");
    }
  };

  return (
    <div>
      {walletAddress ? (
        <p>🔗 Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default WalletConnect;
