module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const prescriptionContract = await deployments.get("PrescriptionContract");

  const supplyChain = await deploy("DrugSupplyChain", {
    from: deployer,
    args: [prescriptionContract.address],
    log: true,
  });

  console.log("DrugSupplyChain deployed to:", supplyChain.address);
};

module.exports.tags = ["all", "Supply"];
