const advanceBlock = require('../helpers/advanceToBlock');
const increaseTimeTo = require('../helpers/increaseTime').increaseTimeTo;
const duration = require('../helpers/increaseTime').duration;
const latestTime = require('../helpers/latestTime');

const BigNumber = web3.BigNumber;

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const PixieCrowdsale = artifacts.require('PixieCrowdsale');
const PixieToken = artifacts.require('PixieToken');

contract('PixieCrowdsale', function ([owner, investor, wallet]) {

  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.token = await PixieToken.new();

    this.crowdsale = await PixieCrowdsale.new(wallet, this.token.address);

    this.initialSupply = await this.token.initialSupply();
    this.amountAvailableForPurchase = this.initialSupply.times(0.4); // 40% of total supply

    this.privateSaleRate = await this.crowdsale.privateSaleRate();
    this.preSaleRate = await this.crowdsale.preSaleRate();
    this.rate = await this.crowdsale.rate();

    this.minContribution = await this.crowdsale.minimumContribution();

    this.softCap = await this.crowdsale.softCap();
    this.hardCap = await this.crowdsale.hardCap();

    this.value = this.minContribution;
    this.standardExpectedTokenAmount = this.rate.mul(this.value);
    this.preSaleExpectedTokenAmount = this.preSaleRate.mul(this.value);
    this.privateSaleExpectedTokenAmount = this.privateSaleRate.mul(this.value);

    // approve so they can invest in crowdsale
    await this.crowdsale.addToWhitelist(owner);
    await this.crowdsale.addToWhitelist(investor);

    /////////////////////////////////////////////////////////////////////
    // SET custom dates based on current block and not contract values //
    /////////////////////////////////////////////////////////////////////

    this.openingTime = await latestTime() + duration.seconds(60);
    await this.crowdsale.updateOpeningTime(this.openingTime, {from: owner});

    this.privateSaleCloseTime = this.openingTime + duration.weeks(1);
    await this.crowdsale.updatePrivateSaleCloseTime(this.privateSaleCloseTime, {from: owner});

    this.preSaleCloseTime = this.openingTime + duration.weeks(2);
    await this.crowdsale.updatePreSaleCloseTime(this.preSaleCloseTime, {from: owner});

    this.closingTime = this.openingTime + duration.weeks(4);
    await this.crowdsale.updateClosingTime(this.closingTime, {from: owner});

    this.afterClosingTime = this.closingTime + duration.seconds(1);

    /////////////////////////////////////////////////////////////////////
    // END custom dates based on current block and not contract values //
    /////////////////////////////////////////////////////////////////////


    // ensure owner and all accounts are whitelisted
    assert.isTrue(await this.token.whitelist(owner));

    await this.token.addAddressesToWhitelist([investor]);

    // ensure the crowdsale can transfer tokens - whitelist in token
    await this.token.addAddressToWhitelist(this.crowdsale.address);

    // transfer balance to crowdsale to allow ICO token distribution
    await this.token.transfer(this.crowdsale.address, this.amountAvailableForPurchase);
  });

  describe('ensure rate can be determined from default events', function () {

    describe('private sale', function () {

      beforeEach(async function () {
        await increaseTimeTo(this.privateSaleCloseTime - duration.seconds(10)); // force time to move on to just before private close
      });

      it('should determine rate', async function () {
        const {logs} = await this.crowdsale.sendTransaction({value: this.value, from: investor});
        const event = logs.find(e => e.event === 'TokenPurchase');
        should.exist(event);
        event.args.purchaser.should.equal(investor);
        event.args.beneficiary.should.equal(investor);
        event.args.value.should.be.bignumber.equal(this.value);
        event.args.amount.should.be.bignumber.equal(this.privateSaleExpectedTokenAmount);
        event.args.amount.div(event.args.value).should.be.bignumber.equal(this.privateSaleRate);
      });
    });

    describe('pre sale', function () {

      beforeEach(async function () {
        await increaseTimeTo(this.preSaleCloseTime - duration.seconds(10)); // force time to move on to just before pre close
      });

      it('should determine rate', async function () {
        const {logs} = await this.crowdsale.sendTransaction({value: this.value, from: investor});
        const event = logs.find(e => e.event === 'TokenPurchase');
        should.exist(event);
        event.args.purchaser.should.equal(investor);
        event.args.beneficiary.should.equal(investor);
        event.args.value.should.be.bignumber.equal(this.value);
        event.args.amount.should.be.bignumber.equal(this.preSaleExpectedTokenAmount);
        event.args.amount.div(event.args.value).should.be.bignumber.equal(this.preSaleRate);
      });
    });

    describe('normal sale', function () {

      beforeEach(async function () {
        await increaseTimeTo(this.closingTime - duration.seconds(10)); // force time to move on to just before closing
      });

      it('should determine rate', async function () {
        const {logs} = await this.crowdsale.sendTransaction({value: this.value, from: investor});
        const event = logs.find(e => e.event === 'TokenPurchase');
        should.exist(event);
        event.args.purchaser.should.equal(investor);
        event.args.beneficiary.should.equal(investor);
        event.args.value.should.be.bignumber.equal(this.value);
        event.args.amount.should.be.bignumber.equal(this.standardExpectedTokenAmount);
        event.args.amount.div(event.args.value).should.be.bignumber.equal(this.rate);
      });
    });

  });

});
