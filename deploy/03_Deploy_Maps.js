let { networkConfig } = require('../helper-hardhat-config');
const fs = require('fs');

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  log('Starting deployment 🚀');

  const v1Address = '0xD81f156bBF7043a22d4cE97C0E8ca11d3f4FB3cC';
  const args = [v1Address];
  const MAPS = await deploy('MapRestored', {
    from: deployer,
    log: true,
    args: args,
  });
  log(`Contract has been deployed to to ${MAPS.address}\n`);
  const mapsContract = await ethers.getContractFactory('MapRestored');
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];
  const maps = new ethers.Contract(
    MAPS.address,
    mapsContract.interface,
    signer
  );
  const networkName = networkConfig[chainId]['name'];

  log(
    `Verify with 🔍\n npx hardhat verify --network ${networkName} ${maps.address}\n`
  );
  log('Minting NFT 🎨');
  tx = await maps.ownerDiscoverMap(9751);
  await tx.wait(1);
  log(`The tokenURI is below ⬇️ \n${await maps.tokenURI(9751)}`);
  log(
    '======================================================================================\n'
  );
};

module.exports.tags = ['all', 'map'];
