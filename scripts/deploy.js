const hre = require("hardhat");

async function main() {
  const ExNFT = await hre.ethers.getContractFactory("ExNFT");
  const exNFT = await ExNFT.deploy();
  await exNFT.deployed();
  console.log("ExNFT deployed to:", exNFT.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
