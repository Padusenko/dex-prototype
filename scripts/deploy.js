const { ethers } = require("hardhat");

async function main() {
  const initialSupply = ethers.parseEther("1000000"); // 1 млн токенів
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(initialSupply);
  await token.waitForDeployment();

  console.log(`✅ Token deployed to: ${token.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
