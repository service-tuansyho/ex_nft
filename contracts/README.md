# Deploying ExNFT Contract

## Prerequisites

- Node.js and npm
- Hardhat or Foundry
- Optimism network access

## Deploy Steps

1. Install dependencies:

```bash
npm install --save-dev hardhat @nomiclabs/hardhat-ethers @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-etherscan
npm install @openzeppelin/contracts
```

2. Create hardhat.config.js:

```javascript
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.19",
  networks: {
    optimism: {
      url: "https://mainnet.optimism.io", // or testnet
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
```

3. Deploy script (scripts/deploy.js):

```javascript
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
```

4. Deploy to Optimism:

```bash
npx hardhat run scripts/deploy.cjs --network optimism
```

5. Update the contract address in `app/profile/page.tsx`:

```typescript
const NFT_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

## Contract Features

- ERC721 compliant
- Mint function that anyone can call
- Owner can set minting fees (optional)
- Token URI support for metadata
