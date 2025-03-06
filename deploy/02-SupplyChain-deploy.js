const developmentChains  = require("../helper-hardhat-config").developmentChains;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const prescriptionContract = await deployments.get("PrescriptionContract");

  const supplyChain = await deploy("DrugSupplyChain", {
    from: deployer,
    args: [prescriptionContract.address],
    log: true,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(supplyChain.address, args);
  }

  console.log("DrugSupplyChain deployed to:", supplyChain.address);
};

module.exports.tags = ["all", "Supply"];
