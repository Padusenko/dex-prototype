import React from "react";
import { Sun, Moon } from "lucide-react";

export default function Header({ userAddress, connectWallet, disconnectWallet, toggleTheme, currentTheme }) {
  return (
    <header className="w-full py-4 px-6 flex justify-between items-center bg-white dark:bg-[#0d1117] border-b border-white/10 shadow-md">
      <h1 className="text-xl md:text-2xl font-bold text-indigo-500 dark:text-indigo-400">DEX<span className="text-gray-900 dark:text-white">Swap</span></h1>

      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="text-gray-700 dark:text-white hover:opacity-80">
          {currentTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {userAddress ? (
          <>
            <div className="text-sm bg-black/10 dark:bg-white/10 px-4 py-1 rounded-xl text-black dark:text-white font-mono truncate max-w-xs">
              {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
            </div>
            <button
              onClick={disconnectWallet}
              className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-white text-sm"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1 rounded text-white"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}
