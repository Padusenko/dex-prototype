import React, { useEffect, useState } from "react";
import Swap from "./components/Swap";
import Header from "./components/Header";

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [currentTheme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", currentTheme === "dark");
  }, [currentTheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
        }
      }
    };
    checkConnection();
  }, []);

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setUserAddress(accounts[0]);
      }
    } catch (error) {
      console.warn("Користувач відхилив підключення MetaMask");
    }
  };

  const disconnectWallet = () => {
    setUserAddress("");
  };

  return (
    <>
      <Header
        userAddress={userAddress}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        currentTheme={currentTheme}
        toggleTheme={toggleTheme}
      />
      <main>
        <Swap userAddress={userAddress} />
      </main>
    </>
  );
}

export default App;
