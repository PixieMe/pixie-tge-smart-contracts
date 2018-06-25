const moment = require('moment');

const advanceBlock = require('../helpers/advanceToBlock');

const BigNumber = web3.BigNumber;

require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber')(BigNumber))
.should();

const PixieCrowdsale = artifacts.require('PixieCrowdsale');
const PixieToken = artifacts.require('PixieToken');
const RefundVault = artifacts.require('RefundVault');

contract('PixieCrowdsale (real dates)', function ([owner, investor, wallet]) {

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.token = await PixieToken.new();

    this.crowdsale = await PixieCrowdsale.new(wallet, this.token.address);
  });

  describe('get correct ICO dates', async function () {

    it('should determine correct epoch time for crowdsale', async function () {
      // Tuesday, July 3, 2018 10:00:00 AM GMT+01:00
      let openingTime = moment().set({
        year: 2018,
        month: 'july',
        date: 3,
        hours: 10,
        minutes: 0,
        seconds: 0,
        milliseconds: 0
      });

      console.log(`opening time: ${openingTime}`);

      let actualOpeningTime = await this.crowdsale.openingTime();
      actualOpeningTime.toString(10).should.be.equal(openingTime.utc().unix().toString());

      // Wednesday, August 1, 2018 9:59:59 AM GMT+01:00
      let privateSaleCloseTime = moment().set({
        year: 2018,
        month: 'august',
        date: 1,
        hours: 9,
        minutes: 59,
        seconds: 59,
        milliseconds: 0
      });

      console.log(`private sale close time: ${privateSaleCloseTime}`);

      let actualPrivateSaleCloseTime = await this.crowdsale.privateSaleCloseTime();
      actualPrivateSaleCloseTime.toString(10).should.be.equal(privateSaleCloseTime.utc().unix().toString());

      // Monday, October 1, 2018 9:59:59 AM GMT+01:00
      let preSaleCloseTime = moment().set({
        year: 2018,
        month: 'october',
        date: 1,
        hours: 9,
        minutes: 59,
        seconds: 59,
        milliseconds: 0
      });

      console.log(`pre sale close time: ${preSaleCloseTime}`);

      let actualPreSaleCloseTime = await this.crowdsale.preSaleCloseTime();
      actualPreSaleCloseTime.toString(10).should.be.equal(preSaleCloseTime.utc().unix().toString());

      // Wednesday, October 31, 2018 9:59:59 AM GMT+00:00
      let closingTime = moment().set({
        year: 2018,
        month: 'october',
        date: 31,
        hours: 9,
        minutes: 59,
        seconds: 59,
        milliseconds: 0
      });

      console.log(`closing time: ${closingTime}`);

      let actualClosingTime = await this.crowdsale.closingTime();
      actualClosingTime.toString(10).should.be.equal(closingTime.utc().unix().toString());
    });

  });

});
