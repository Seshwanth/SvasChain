const main = async () => {
  const prescriptionContractFactory = await ethers.getContractFactory(
    "PrescriptionContract"
  );
  const prescriptionContract = await prescriptionContractFactory.deploy();
  await prescriptionContract.waitForDeployment();
  console.log("Contract deployed to:", await prescriptionContract.getAddress());

  const supplyChainFactory = await ethers.getContractFactory("DrugSupplyChain");
  const supplyChain = await supplyChainFactory.deploy(
    await prescriptionContract.getAddress()
  );
  await supplyChain.waitForDeployment();
  console.log("Supply chain deployed to:", await supplyChain.getAddress());
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
