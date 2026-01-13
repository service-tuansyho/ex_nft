require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env.local" });

module.exports = {
  solidity: "0.8.20",
  networks: {
    optimism: {
      url: "https://mainnet.optimism.io", // or testnet
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
