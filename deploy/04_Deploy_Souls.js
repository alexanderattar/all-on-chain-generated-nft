let { networkConfig } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  log("Starting deployment 🚀");
  const Souls = await deploy("Souls", {
    from: deployer,
    log: true,
    args: [
      "Souls",
      "SOULS",
      "0xaF69610ea9ddc95883f97a6a3171d52165b69B03",
      "0xaF69610ea9ddc95883f97a6a3171d52165b69B03",
      "100",
      "2627308000",
      "0x600a4446094C341693C415E6743567b9bfc8a4A8",
    ],
  });
  log(`Contract has been deployed to to ${Souls.address}\n`);
  const soulsContract = await ethers.getContractFactory("Souls");
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];
  const souls = new ethers.Contract(
    Souls.address,
    soulsContract.interface,
    signer
  );
  const networkName = networkConfig[chainId]["name"];

  log(
    `Verify with 🔍\n npx hardhat verify --network ${networkName} ${souls.address}\n`
  );
  log("Minting NFT 🎨");
  const gasLimit = 30000000; // if gas limit is set, it doesn't superfluosly run estimateGas, slowing tests down.
  const price = "0.068"; // ~$200
  const tx = await souls.mintSoul({
    value: ethers.utils.parseEther(price),
    gasLimit,
  });
  const receipt = await tx.wait();
  const tokenId = receipt.events[0].args.tokenId.toString();
  log(`The tokenURI is below ⬇️ \n${await souls.tokenURI(tokenId)}`);
  log(
    "======================================================================================\n"
  );
};

module.exports.tags = ["all", "souls"];
