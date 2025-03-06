// const { ethers } = require("hardhat");

const networkConfig = {
  11155111: {
    name: "sepolia",
  },
  31337: {
    name: "hardhat",
  },
  2442: {
    name: "cardona",
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = { networkConfig, developmentChains };
