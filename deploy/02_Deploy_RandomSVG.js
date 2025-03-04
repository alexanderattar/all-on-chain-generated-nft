let {
  networkConfig,
  getNetworkIdFromName,
} = require('../helper-hardhat-config');

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, get, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  let linkTokenAddress;
  let vrfCoordinatorAddress;

  // If on local chain use mock addresses
  if (chainId == 31337) {
    let linkToken = await get('LinkToken');
    let VRFCoordinatorMock = await get('VRFCoordinatorMock');
    linkTokenAddress = linkToken.address;
    vrfCoordinatorAddress = VRFCoordinatorMock.address;
    additionalMessage = ' --linkaddress ' + linkTokenAddress;
  } else {
    // Use real contract addresses
    linkTokenAddress = networkConfig[chainId]['linkToken'];
    vrfCoordinatorAddress = networkConfig[chainId]['vrfCoordinator'];
  }
  const keyHash = networkConfig[chainId]['keyHash'];
  const fee = networkConfig[chainId]['fee'];
  args = [vrfCoordinatorAddress, linkTokenAddress, keyHash, fee];
  log('Starting deployment 🚀');
  const RandomSVG = await deploy('RandomSVG', {
    from: deployer,
    args: args,
    log: true,
  });
  log(`Contract has been deployed to to  ${RandomSVG.address}`);
  const networkName = networkConfig[chainId]['name'];
  log(
    `Verify with 🔍\nnpx hardhat verify --network ${networkName} ${
      RandomSVG.address
    } ${args.toString().replace(/,/g, ' ')}\n`
  );
  const RandomSVGContract = await ethers.getContractFactory('RandomSVG');
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];
  const randomSVG = new ethers.Contract(
    RandomSVG.address,
    RandomSVGContract.interface,
    signer
  );

  // Fund with LINK
  let networkId = await getNetworkIdFromName(network.name);
  const fundAmount = networkConfig[networkId]['fundAmount'];
  const linkTokenContract = await ethers.getContractFactory('LinkToken');
  const linkToken = new ethers.Contract(
    linkTokenAddress,
    linkTokenContract.interface,
    signer
  );
  let fundTx = await linkToken.transfer(RandomSVG.address, fundAmount);
  await fundTx.wait(1);
  // await new Promise(r => setTimeout(r, 5000))
  log('Minting NFT 🎨');
  tx = await randomSVG.create({ gasLimit: 300000 });
  let receipt = await tx.wait(1);
  let tokenId = receipt.events[3].topics[2];
  log(`Creating NFT with token ID: ${tokenId}`);
  log('Waiting for the Chainlink VRF node to respond...');
  if (chainId != 31337) {
    await new Promise((r) => setTimeout(r, 180000));
    log(`Finishing mint...`);
    tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000 });
    await tx.wait(1);
    log(`The tokenURI is below ⬇️ \n${await randomSVG.tokenURI(0)}`);
  } else {
    log('Chain ID is not 31337');
    const VRFCoordinatorMock = await deployments.get('VRFCoordinatorMock');
    vrfCoordinator = await ethers.getContractAt(
      'VRFCoordinatorMock',
      VRFCoordinatorMock.address,
      signer
    );
    let transactionResponse = await vrfCoordinator.callBackWithRandomness(
      receipt.logs[3].topics[1],
      77777,
      randomSVG.address
    );
    await transactionResponse.wait(1);
    log(`Finishing mint...`);
    tx = await randomSVG.finishMint(tokenId, { gasLimit: 2000000 });
    await tx.wait(1);
    log(`The tokenURI is below ⬇️ \n${await randomSVG.tokenURI(0)}`);
  }
};

module.exports.tags = ['all', 'rsvg'];
