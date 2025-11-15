const hre = require("hardhat");

async function main() {
  console.log("Deploying LovesPlatform contract...");

  const LovesPlatform = await hre.ethers.getContractFactory("LovesPlatform");
  const platform = await LovesPlatform.deploy();

  await platform.waitForDeployment();

  const address = await platform.getAddress();
  console.log("LovesPlatform deployed to:", address);
  console.log("Owner:", await platform.owner());

  // Verify on block explorer (if on testnet/mainnet)
  if (hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await platform.deploymentTransaction().wait(5);

    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

