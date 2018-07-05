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

  // whitelist the crowdsale - so it can transfer tokens to contributors
  await deployedPixieToken.addAddressToWhitelist(PixieCrowdsale.address, {from: _contractCreatorAccount});

  // owner is included in onlyManagement guard  but this protects in case of ownership transfer
  await deployedPixieCrowdsale.addToManagementWhitelist(_contractCreatorAccount);
};
