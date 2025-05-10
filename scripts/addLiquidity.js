const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();

  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const dexAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const Token = await ethers.getContractAt("Token", tokenAddress);
  const Dex = await ethers.getContractAt("Dex", dexAddress);

  const tokenAmount = ethers.parseUnits("1000", 18);
  const ethAmount = ethers.parseEther("1");

  const approvalTx = await Token.approve(dexAddress, tokenAmount);
  await approvalTx.wait();

  const tx = await Dex.addLiquidity(tokenAmount, { value: ethAmount });
  await tx.wait();

  console.log(`✅ Додано 1000 токенів + 1 ETH у пул`);

  const reserveETH = await Dex.reserveETH();
  const reserveToken = await Dex.reserveToken();

  console.log(`📊 Поточний пул: ${ethers.formatEther(reserveToken)} токенів, ${ethers.formatEther(reserveETH)} ETH`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
