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

  console.log(
    "PrescriptionContract deployed to:",
    prescriptionContract.address
  );
};

module.exports.tags = ["all", "Prescription"];
