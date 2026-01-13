import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default {
  solidity: "0.8.20",
  networks: {
    optimism: {
      url: "https://mainnet.optimism.io", // or testnet
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
