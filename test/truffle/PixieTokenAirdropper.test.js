const assertRevert = require('../helpers/assertRevert');
const toPromise = require('../helpers/toPromise');
const expectThrow = require('../helpers/expectThrow');

const PixieToken = artifacts.require('PixieToken');
const PixieTokenAirdropper = artifacts.require('PixieTokenAirdropper');
const ForceEther = artifacts.require('ForceEther');

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

contract('PixieTokenAirdropper', function ([_, owner, account1, account2, account3, account4]) {

  const amount = web3.toWei('1', 'ether');

  beforeEach(async function () {
    this.token = await PixieToken.new({from: owner});
  });

  it('should be constructorable', async function () {
    await PixieTokenAirdropper.new(this.token.address, {from: owner});
  });

  describe('accepting payments', async function () {
    it('should not accept ether', async function () {
      let airdroppper = await PixieTokenAirdropper.new(this.token.address);

      await expectThrow(
        toPromise(web3.eth.sendTransaction)({
          from: owner,
          to: airdroppper.address,
          value: amount,
        }),
      );
    });
  });

  describe('batch transfer', async function () {

    it('cannot transfer if airdropper not whitelisted', async function () {
      let airdroppper = await PixieTokenAirdropper.new(this.token.address, {from: owner});
      await assertRevert(airdroppper.transfer([account1], [10], {from: owner}));
    });

    it('cannot transfer if not owner', async function () {
      let airdroppper = await PixieTokenAirdropper.new(this.token.address, {from: owner});
      await assertRevert(airdroppper.transfer([owner], [10], {from: account1}));
    });

    it('cannot transfer more tokens than allowed', async function () {
      let airdroppper = await PixieTokenAirdropper.new(this.token.address, {from: owner});

      await this.token.addAddressToWhitelist(airdroppper.address, {from: owner});

      await assertRevert(airdroppper.transfer([account1], [10], {from: owner}));
    });

    it('can transfer only once airdropper has be allocated tokens', async function () {
      let airdroppper = await PixieTokenAirdropper.new(this.token.address, {from: owner});

      // Whitelist airdropper
      await this.token.addAddressToWhitelist(airdroppper.address, {from: owner});

      // transfer allowance
      await this.token.transfer(airdroppper.address, 10, {from: owner});

      // Check allowance transferred
      let airdropBalance = await this.token.balanceOf(airdroppper.address);
      airdropBalance.should.be.bignumber.equal(10);

      // Check account has no balance
      let accountBalance = await this.token.balanceOf(account1);
      accountBalance.should.be.bignumber.equal(0);

      // try to send to account1
      await airdroppper.transfer([account1], [5], {from: owner});

      // Check airdropBalance adjusted
      airdropBalance = await this.token.balanceOf(airdroppper.address);
      airdropBalance.should.be.bignumber.equal(5);

      // Check account balance adjusted
      accountBalance = await this.token.balanceOf(account1);
      accountBalance.should.be.bignumber.equal(5);
    });

    it('can transfer unused tokens back to token form airdropper via transfer() function', async function () {
      let airdroppper = await PixieTokenAirdropper.new(this.token.address, {from: owner});

      let originalBalance = await this.token.totalSupply();

      // Whitelist airdropper
      await this.token.addAddressToWhitelist(airdroppper.address, {from: owner});

      // transfer allowance
      let ownerbalance = await this.token.balanceOf(owner, {from: owner});
      ownerbalance.should.be.bignumber.equal(originalBalance);

      // transfer allowance
      await this.token.transfer(airdroppper.address, 10, {from: owner});

      // Check owner balance been reduced
      ownerbalance = await this.token.balanceOf(owner, {from: owner});
      ownerbalance.should.be.bignumber.equal(originalBalance.minus(10));

      // Check allowance transferred
      let airdropBalance = await this.token.balanceOf(airdroppper.address);
      airdropBalance.should.be.bignumber.equal(10);

      // try to send the tokens back to the owner
      await airdroppper.transfer([owner], [10], {from: owner});

      // Check airdropBalance adjusted
      airdropBalance = await this.token.balanceOf(airdroppper.address);
      airdropBalance.should.be.bignumber.equal(0);

      // Check owner balance gone back up
      ownerbalance = await this.token.balanceOf(owner, {from: owner});
      ownerbalance.should.be.bignumber.equal(originalBalance);
    });

    it('can transfer unused tokens back to token form airdropper via ownerRecoverTokens() function', async function () {
      let airdroppper = await PixieTokenAirdropper.new(this.token.address, {from: owner});

      let originalBalance = await this.token.totalSupply();

      // Whitelist airdropper
      await this.token.addAddressToWhitelist(airdroppper.address, {from: owner});

      // transfer allowance
      let ownerbalance = await this.token.balanceOf(owner, {from: owner});
      ownerbalance.should.be.bignumber.equal(originalBalance);

      // transfer allowance
      await this.token.transfer(airdroppper.address, 10, {from: owner});

      // Check owner balance been reduced
      ownerbalance = await this.token.balanceOf(owner, {from: owner});
      ownerbalance.should.be.bignumber.equal(originalBalance.minus(10));

      // Check allowance transferred
      let airdropBalance = await this.token.balanceOf(airdroppper.address);
      airdropBalance.should.be.bignumber.equal(10);

      // try to send the tokens back to the owner
      await airdroppper.ownerRecoverTokens(owner, {from: owner});

      // Check airdropBalance adjusted
      airdropBalance = await this.token.balanceOf(airdroppper.address);
      airdropBalance.should.be.bignumber.equal(0);

      // Check owner balance gone back up
      ownerbalance = await this.token.balanceOf(owner, {from: owner});
      ownerbalance.should.be.bignumber.equal(originalBalance);
    });

    it('can transfer to multiple accounts at once', async function () {
      let airdroppper = await PixieTokenAirdropper.new(this.token.address, {from: owner});

      let originalBalance = await this.token.totalSupply();

      // Whitelist airdropper
      await this.token.addAddressToWhitelist(airdroppper.address, {from: owner});

      // transfer allowance
      let ownerbalance = await this.token.balanceOf(owner, {from: owner});
      ownerbalance.should.be.bignumber.equal(originalBalance);

      // transfer allowance
      await this.token.transfer(airdroppper.address, 100, {from: owner});

      // Check owner balance been reduced
      ownerbalance = await this.token.balanceOf(owner, {from: owner});
      ownerbalance.should.be.bignumber.equal(originalBalance.minus(100));

      // Check allowance transferred
      let airdropBalance = await this.token.balanceOf(airdroppper.address);
      airdropBalance.should.be.bignumber.equal(100);

      // try to send the tokens back to the owner
      await airdroppper.transfer([account1, account2, account3, account4], [10, 20, 15, 40], {from: owner});

      let account1Balance = await this.token.balanceOf(account1);
      account1Balance.should.be.bignumber.equal(10);

      let account2Balance = await this.token.balanceOf(account2);
      account2Balance.should.be.bignumber.equal(20);

      let account3Balance = await this.token.balanceOf(account3);
      account3Balance.should.be.bignumber.equal(15);

      let account4Balance = await this.token.balanceOf(account4);
      account4Balance.should.be.bignumber.equal(40);

      airdropBalance = await this.token.balanceOf(airdroppper.address);
      airdropBalance.should.be.bignumber.equal(15);
    });
  });

  describe('HasNoEther', async function () {

    const amount = web3.toWei('1', 'ether');

    it('should not accept ether in constructor', async function () {
      await expectThrow(PixieTokenAirdropper.new(this.token.address, {value: amount}));
    });

    it('should not accept ether', async function () {
      let hasNoEther = await PixieTokenAirdropper.new(this.token.address);

      await expectThrow(
        toPromise(web3.eth.sendTransaction)({
          from: account2,
          to: hasNoEther.address,
          value: amount,
        }),
      );
    });

    it('should allow owner to reclaim ether', async function () {
      // Create contract
      let hasNoEther = await PixieTokenAirdropper.new(this.token.address, {from: owner});
      const startBalance = await web3.eth.getBalance(hasNoEther.address);
      startBalance.should.be.bignumber.equal(0);

      // Force ether into it
      let forceEther = await ForceEther.new({value: amount});
      await forceEther.destroyAndSend(hasNoEther.address);
      const forcedBalance = await web3.eth.getBalance(hasNoEther.address);
      forcedBalance.should.be.bignumber.equal(amount);

      // Reclaim
      const ownerStartBalance = await web3.eth.getBalance(owner);
      await hasNoEther.reclaimEther({from: owner});
      const ownerFinalBalance = await web3.eth.getBalance(owner);
      const finalBalance = await web3.eth.getBalance(hasNoEther.address);

      finalBalance.should.be.bignumber.equal(0);
      ownerFinalBalance.should.be.bignumber.above(ownerStartBalance);
    });

    it('should allow only owner to reclaim ether', async function () {
      // Create contract
      let hasNoEther = await PixieTokenAirdropper.new(this.token.address, {from: account1});

      // Force ether into it
      let forceEther = await ForceEther.new({value: amount});
      await forceEther.destroyAndSend(hasNoEther.address);
      const forcedBalance = await web3.eth.getBalance(hasNoEther.address);
      assert.equal(forcedBalance, amount);

      // Reclaim
      await expectThrow(hasNoEther.reclaimEther({from: account2}));
    });
  });

});
