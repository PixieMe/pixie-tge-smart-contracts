/* global web3:true */
const PixieToken = artifacts.require('PixieToken');
const PixieCrowdsale = artifacts.require('PixieCrowdsale');

const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = 'fkWxG7nrciMRrRD36yVj';
let mnemonic = require('../mnemonic');

module.exports = async function (deployer, network, accounts) {

  console.log(`Running within network = ${network}`);

  const deployedPixieToken = await PixieToken.deployed();
  const deployedPixieCrowdsale = await PixieCrowdsale.deployed();

  let _contractCreatorAccount;

  // Load in other accounts for different networks
  if (network === 'ropsten' || network === 'rinkeby') {
    _contractCreatorAccount = new HDWalletProvider(mnemonic, `https://${network}.infura.io/${infuraApikey}`, 0).getAddress();
  } else {
    _contractCreatorAccount = accounts[0];
  }

  console.log(`_contractCreatorAccount - [${_contractCreatorAccount}]`);

  const _tokenInitialSupply = await deployedPixieToken.initialSupply();
  const _crowdsaleSupply = _tokenInitialSupply.times(0.4); // 40% of total

  console.log(`_tokenInitialSupply - [${_tokenInitialSupply}]`);
  console.log(`_crowdsaleSupply - [${_crowdsaleSupply}]`);

  // must transfer to crowdsale so the crowsale has a balance to transfer to contributors when the send ETH
  await deployedPixieToken.transfer(PixieCrowdsale.address, _crowdsaleSupply);
};
