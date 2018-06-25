#!/usr/bin/env bash

node ./node_modules/.bin/truffle-flattener ./contracts/PixieCrowdsale.sol > ./contracts-flat/FLAT-PixieCrowdsale.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/PixieToken.sol > ./contracts-flat/FLAT-PixieToken.sol;

node ./node_modules/.bin/truffle-flattener ./contracts/PixieTokenAirdropper.sol > ./contracts-flat/FLAT-PixieTokenAirdropper.sol;
