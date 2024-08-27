// Import Hardhat Runtime Environment
const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const LocalStore = await hre.ethers.getContractFactory("LocalStore");
  
  // Deploy the contract
  console.log("Deploying LocalStore contract...");
  const localStore = await LocalStore.deploy();
  
  // Wait for the contract to be deployed
  await localStore.deployed();
  
  // Log the contract address
  console.log("LocalStore deployed to:", localStore.address);

  // Additional verification to ensure the contract is deployed correctly
  console.log("Contract deployed successfully!");
}

main().catch((error) => {
  console.error("Error in deployment script:", error);
  process.exitCode = 1;
});
