const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  // Підстав сюди адресу токена, який уже розгорнуто раніше:
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const Dex = await ethers.getContractFactory("Dex");
  const dex = await Dex.deploy(tokenAddress);
  await dex.waitForDeployment();

  console.log(`✅ Dex deployed to: ${dex.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
