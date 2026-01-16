const hre = require("hardhat");

async function main() {
  const ExNFT = await hre.ethers.getContractFactory("ExNFT");
  const exNFT = await ExNFT.deploy();
  await exNFT.deployed();
  console.log("ExNFT deployed to:", exNFT.address);

  // Set mint fee to 0.00001 ETH (10000000000000 wei)
  const mintFee = hre.ethers.utils.parseEther("0.00001");
  const setFeeTx = await exNFT.setMintFee(mintFee);
  await setFeeTx.wait();
  console.log("Mint fee set to 0.00001 ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
