import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { DEX_ABI, DEX_ADDRESS, TOKEN_ABI, TOKEN_ADDRESS } from "../utils/contracts";

export default function Swap({ userAddress }) {
  const [ethBalance, setEthBalance] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState("ethToToken");
  const [history, setHistory] = useState([]);
  const [estimate, setEstimate] = useState("");
  const [priceEthToToken, setPriceEthToToken] = useState(null);
  const [priceTokenToEth, setPriceTokenToEth] = useState(null);
  const [poolEth, setPoolEth] = useState("0");
  const [poolToken, setPoolToken] = useState("0");

  useEffect(() => {
    if (userAddress) {
      loadBalances();
      loadHistory();
      loadPrices();
      loadPoolReserves();
    }
  }, [userAddress]);

  useEffect(() => {
    if (amount && !isNaN(amount)) {
      estimateAmount(amount);
    }
  }, [amount, direction]);

  const loadBalances = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

      const ethBal = await provider.getBalance(userAddress);
      const tokenBal = await token.balanceOf(userAddress);

      setEthBalance(ethers.formatEther(ethBal));
      setTokenBalance(ethers.formatEther(tokenBal));
    } catch (err) {
      console.warn("Load balances error:", err.message);
    }
  };

  const loadHistory = () => {
    const saved = localStorage.getItem("swapHistory");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  };

  const updateHistory = (entry) => {
    const newEntry = {
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: entry,
    };
    const updated = [newEntry, ...history];
    setHistory(updated);
    localStorage.setItem("swapHistory", JSON.stringify(updated));
  };

  const handleMax = () => {
    const max =
      direction === "ethToToken"
        ? (parseFloat(ethBalance) - 0.001).toFixed(6)
        : parseFloat(tokenBalance).toFixed(6);
    setAmount(max);
    estimateAmount(max);
  };

  const estimateAmount = async (value) => {
    if (!userAddress || !value || isNaN(value)) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, provider);
      const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

      const [ethReserve, tokenReserve] = await Promise.all([
        provider.getBalance(DEX_ADDRESS),
        token.balanceOf(DEX_ADDRESS),
      ]);

      const input = ethers.parseEther(value);
      const reserveIn = direction === "ethToToken" ? ethReserve : tokenReserve;
      const reserveOut = direction === "ethToToken" ? tokenReserve : ethReserve;

      const out = await dex.getAmountOut(input, reserveIn, reserveOut);
      setEstimate(ethers.formatEther(out));
    } catch (err) {
      console.warn("Estimate error:", err.message);
    }
  };

  const swap = async () => {
    if (!userAddress || !amount) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const dex = new ethers.Contract(DEX_ADDRESS, DEX_ABI, signer);
      const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const parsedAmount = ethers.parseEther(amount);
      const ethReserve = await provider.getBalance(DEX_ADDRESS);
      const tokenReserve = await token.balanceOf(DEX_ADDRESS);

      let out;

      if (direction === "ethToToken") {
        out = await dex.getAmountOut(parsedAmount, ethReserve, tokenReserve);
        const tx = await dex.swapEthToToken({ value: parsedAmount });
        await tx.wait();
        updateHistory(
          `📤 ${amount} ETH → 📥 ${parseFloat(ethers.formatEther(out)).toFixed(4)} TOKEN`
        );
      } else {
        out = await dex.getAmountOut(parsedAmount, tokenReserve, ethReserve);
        const approveTx = await token.approve(DEX_ADDRESS, parsedAmount);
        await approveTx.wait();
        const tx = await dex.swapTokenToEth(parsedAmount);
        await tx.wait();
        updateHistory(
          `📤 ${amount} TOKEN → 📥 ${parseFloat(ethers.formatEther(out)).toFixed(4)} ETH`
        );
      }

      setAmount("");
      setEstimate("");
      loadBalances();
      loadPrices();
      loadPoolReserves();
    } catch (err) {
      console.error("Swap error:", err.message);
    }
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const loadPrices = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

      const [ethReserve, tokenReserve] = await Promise.all([
        provider.getBalance(DEX_ADDRESS),
        token.balanceOf(DEX_ADDRESS),
      ]);

      const eth = parseFloat(ethers.formatEther(ethReserve));
      const tokenAmt = parseFloat(ethers.formatEther(tokenReserve));

      if (eth > 0 && tokenAmt > 0) {
        setPriceEthToToken((tokenAmt / eth).toFixed(6));
        setPriceTokenToEth((eth / tokenAmt).toFixed(6));
      }
    } catch (err) {
      console.warn("Load prices error:", err.message);
    }
  };

  const loadPoolReserves = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

      const [ethReserve, tokenReserve] = await Promise.all([
        provider.getBalance(DEX_ADDRESS),
        token.balanceOf(DEX_ADDRESS),
      ]);

      setPoolEth(parseFloat(ethers.formatEther(ethReserve)).toFixed(6));
      setPoolToken(parseFloat(ethers.formatEther(tokenReserve)).toFixed(6));
    } catch (err) {
      console.warn("Load pool reserves error:", err.message);
    }
  };

  if (!userAddress) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-[#161b22] px-4">
        <div className="bg-white dark:bg-[#1c1f26] text-black dark:text-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-4">
          <div className="text-4xl">🔌</div>
          <h2 className="text-xl font-semibold">Гаманець не підключено</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Натисни кнопку <span className="text-indigo-500 font-semibold">Connect Wallet</span> у верхньому правому куті, щоб підключитися.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-[#0d1117] px-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1c1f26] text-black dark:text-white rounded-2xl shadow-xl p-6 space-y-6">
        <h2 className="text-2xl font-bold text-center">Swap</h2>

        <div className="text-sm space-y-1 bg-gray-100 dark:bg-[#2c313c] p-4 rounded-xl">
          <div className="w-full text-center text-sm text-gray-700 dark:text-gray-300">
            👛Баланс гаманця:
          </div>
          <p><span className="text-indigo-500">💵 ETH:</span> <span className="font-mono">{parseFloat(ethBalance).toFixed(6)}</span></p>
          <p><span className="text-indigo-500">💵 Token:</span> <span className="font-mono">{parseFloat(tokenBalance).toFixed(6)}</span></p>
        </div>

        <div className="text-sm space-y-1 bg-gray-100 dark:bg-[#2c313c] p-4 rounded-xl">
          <div className="w-full text-center text-sm text-gray-700 dark:text-gray-300">
            💼Пул ліквідності:
          </div>
          <div><span className="text-indigo-500">💵 ETH:</span><span className="font-mono"> {poolEth}</span></div>
          <div><span className="text-indigo-500">💵 Token:</span><span className="font-mono"> {poolToken}</span></div>
        </div>

        {priceEthToToken && priceTokenToEth && (
          <div className="text-sm space-y-1 bg-gray-100 dark:bg-[#2c313c] p-4 rounded-xl">
            <div className="w-full text-center text-sm text-gray-700 dark:text-gray-300">
              💱Курс обміну:
            </div>
            <div>💱 1 <span className="text-indigo-500">ETH</span> ≈ <span className="font-mono">{priceEthToToken}</span> <span className="text-indigo-500">Token</span></div>
            <div>💱 1 <span className="text-indigo-500">Token</span> ≈ <span className="font-mono">{priceTokenToEth}</span> <span className="text-indigo-500">ETH</span></div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-2 items-center">
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
              className="bg-gray-100 dark:bg-[#2c313c] text-black dark:text-white p-2 rounded min-w-[140px]"
            >
              <option value="ethToToken">ETH → Token</option>
              <option value="tokenToEth">Token → ETH</option>
            </select>
            <div className="relative w-full">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={handleAmountChange}
                className="bg-gray-100 dark:bg-[#2c313c] text-black dark:text-white p-2 pr-16 rounded w-full"
              />
              <button
                onClick={handleMax}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm bg-gray-200 dark:bg-[#3a3f4b] hover:bg-gray-300 dark:hover:bg-[#505564] px-3 py-1 rounded"
              >
                MAX
              </button>
            </div>
          </div>

          {estimate && amount && parseFloat(amount) > 0 && (
            <div className="text-sm text-gray-700 dark:text-gray-400 text-center">
              ≈ Ви отримаєте: <span className="text-black dark:text-white font-mono">{parseFloat(estimate).toFixed(6)}</span>
              {" "}<span className="text-indigo-500">{direction === "ethToToken" ? "TOKEN" : "ETH"}</span>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={swap}
              className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded text-white font-bold"
            >
              Swap
            </button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">📜 Історія обмінів</h3>
            {history.length > 0 && (
              <button
                onClick={() => {
                  localStorage.removeItem("swapHistory");
                  setHistory([]);
                }}
                className="text-sm text-red-400 hover:text-red-300"
              >
                Очистити
              </button>
            )}
          </div>
          <ul className="space-y-1 text-sm max-h-40 overflow-y-auto font-mono text-black dark:text-gray-200">
            {history.map((item, index) => (
              <li key={index} className="bg-gray-100 dark:bg-[#2c313c] px-3 py-1 rounded-md">
                • <span className="text-indigo-500">{item.time}</span>: {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
