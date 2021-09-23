let { networkConfig } = require('../helper-hardhat-config');
const fs = require('fs');

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  log('Starting deployment 🚀');
  const SVGNFT = await deploy('SVGNFT', {
    from: deployer,
    log: true,
  });
  log(`Contract has been deployed to to ${SVGNFT.address}\n`);
  const svgNFTContract = await ethers.getContractFactory('SVGNFT');
  const accounts = await hre.ethers.getSigners();
  const signer = accounts[0];
  const svgNFT = new ethers.Contract(
    SVGNFT.address,
    svgNFTContract.interface,
    signer
  );
  const networkName = networkConfig[chainId]['name'];

  log(
    `Verify with 🔍\n npx hardhat verify --network ${networkName} ${svgNFT.address}\n`
  );
  log('Minting NFT 🎨');
  let filepath = './img/small_enough.svg';
  let svg = fs.readFileSync(filepath, { encoding: 'utf8' });
  log(
    `The image located at ${filepath} will be the SVG, and this will turn into a tokenURI\n`
  );
  tx = await svgNFT.create(svg);
  await tx.wait(1);
  log(`The tokenURI is below ⬇️ \n${await svgNFT.tokenURI(0)}`);
  log(
    '======================================================================================\n'
  );
};

module.exports.tags = ['all', 'svg'];
