const developmentChains  = require("../helper-hardhat-config").developmentChains;
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  //   console.log(deployments);
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log(network.name);

  const prescriptionContract = await deploy("PrescriptionContract", {
    from: deployer,
    log: true,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(prescriptionContract.address, args);
  }

  console.log(
    "PrescriptionContract deployed to:",
    prescriptionContract.address
  );
};

module.exports.tags = ["all", "Prescription"];
