/* global web3:true */
const Promise = require('bluebird');
const PixieToken = artifacts.require('PixieToken');
const PixieCrowdsale = artifacts.require('PixieCrowdsale');

const HDWalletProvider = require('truffle-hdwallet-provider');
const infuraApikey = 'fkWxG7nrciMRrRD36yVj';
let mnemonic = require('../mnemonic');

module.exports = function (deployer, network, accounts) {

  console.log(`Running within network = ${network}`);

  let _contractCreatorAccount;

  // Load in other accounts for different networks
  if (network === 'ropsten' || network === 'rinkeby') {
    _contractCreatorAccount = new HDWalletProvider(mnemonic, `https://${network}.infura.io/${infuraApikey}`, 0).getAddress();
  } else {
    _contractCreatorAccount = accounts[0];
  }

  console.log(`_contractCreatorAccount - [${_contractCreatorAccount}]`);

  return deployer.deploy(PixieToken)
  .then(() => {
    return deployer.deploy(PixieCrowdsale, _contractCreatorAccount, PixieToken.address);
  });
};
