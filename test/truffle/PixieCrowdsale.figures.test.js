const BigNumber = web3.BigNumber;

require('chai')
.use(require('chai-as-promised'))
.use(require('chai-bignumber')(BigNumber))
.should();

contract('PixieCrowdsale (figures and calcs helper)', function ([owner, investor, wallet]) {

  describe('some basic calculations', function () {
    it('simple test to work out rates', async function () {
      let hardCapInEther = new BigNumber('101000');
      let softCapInEther = new BigNumber('2650');
      let totalSupply = new BigNumber('100000000000'); // 40%
      let icoSupply = totalSupply.times(0.4); // 40%

      let priceOfOneEthInUSD = new BigNumber('534.436010');

      let rate = icoSupply.div(hardCapInEther);

      let priceOfOneTokenInUSD = priceOfOneEthInUSD.div(rate);

      console.log(`-----`);
      console.log('Hard Cap in ETH', hardCapInEther.toFormat(0).toString(10));
      console.log('Soft Cap in ETH', softCapInEther.toFormat(0).toString(10));
      console.log('Total Supply', totalSupply.toFormat(0).toString(10));
      console.log('ICO Supply (40% of total supply)', icoSupply.toFormat(0).toString(10));

      console.log(`-----`);
      console.log('Price of 1 ETH in USD', priceOfOneEthInUSD.toFormat(2).toString(10));
      console.log('Price of 1 token in USD', priceOfOneTokenInUSD.toFormat(6).toString(10));

      console.log(`-----`);
      console.log('Rate per ETH', rate.toFormat(0).toString(10));

      let rateWith12AndAHalfPercentBonus = rate.times(1.125); // 12.5% discount
      console.log('Rate per ETH - 12.5% bonus - ', rateWith12AndAHalfPercentBonus.toFormat(0).toString(10));

      let rateWith22AndAHalfPercentBonus = rate.times(1.225); // 22.5% discount
      console.log('Rate per ETH - 22.5% bonus - ', rateWith22AndAHalfPercentBonus.toFormat(0).toString(10));

      let sellAllNoBonus = icoSupply.div(rate);
      let sellAllInPrivate = icoSupply.div(rateWith22AndAHalfPercentBonus);
      let sellAllInPre = icoSupply.div(rateWith12AndAHalfPercentBonus);

      console.log(`-----`);
      console.log(`No. of ETH collected if all sold at 0% bonus - ${sellAllNoBonus.toFormat(2).toString(10)} ($${sellAllNoBonus.times(priceOfOneEthInUSD).toFormat(2).toString(10)})`);
      console.log(`No. of ETH collected if all sold at 22.5% bonus - ${sellAllInPrivate.toFormat(2).toString(10)} ($${sellAllInPrivate.times(priceOfOneEthInUSD).toFormat(2).toString(10)})`);
      console.log(`No. of ETH collected if all sold at 12.5% bonus - ${sellAllInPre.toFormat(2).toString(10)} ($${sellAllInPre.times(priceOfOneEthInUSD).toFormat(2).toString(10)})`);

      let halfSupply = icoSupply.times(0.5);

      sellAllNoBonus = halfSupply.div(rate);
      sellAllInPrivate = halfSupply.div(rateWith22AndAHalfPercentBonus);
      sellAllInPre = halfSupply.div(rateWith12AndAHalfPercentBonus);

      console.log(`-----`);
      console.log(`50% sold: No. of ETH collected if all sold at 0% bonus - ${sellAllNoBonus.toFormat(2).toString(10)} ($${sellAllNoBonus.times(priceOfOneEthInUSD).toFormat(2).toString(10)})`);
      console.log(`50% sold: No. of ETH collected if all sold at 22.5% bonus - ${sellAllInPrivate.toFormat(2).toString(10)} ($${sellAllInPrivate.times(priceOfOneEthInUSD).toFormat(2).toString(10)})`);
      console.log(`50% sold: No. of ETH collected if all sold at 12.5% bonus - ${sellAllInPre.toFormat(2).toString(10)} ($${sellAllInPre.times(priceOfOneEthInUSD).toFormat(2).toString(10)})`);

      let softCapSupply = icoSupply.times(softCapInEther.div(hardCapInEther));

      sellAllNoBonus = softCapSupply.div(rate);
      sellAllInPrivate = softCapSupply.div(rateWith22AndAHalfPercentBonus);
      sellAllInPre = softCapSupply.div(rateWith12AndAHalfPercentBonus);

      console.log(`-----`);
      console.log(`Reached soft cap: No. of ETH collected if all sold at 0% bonus - ${sellAllNoBonus.toFormat(2).toString(10)} ($${sellAllNoBonus.times(priceOfOneEthInUSD).toFormat(2).toString(10)})`);
      console.log(`Reached soft cap: No. of ETH collected if all sold at 25% bonus - ${sellAllInPrivate.toFormat(2).toString(10)} ($${sellAllInPrivate.times(priceOfOneEthInUSD).toFormat(2).toString(10)})`);
      console.log(`Reached soft cap: No. of ETH collected if all sold at 12.5% bonus - ${sellAllInPre.toFormat(2).toString(10)} ($${sellAllInPre.times(priceOfOneEthInUSD).toFormat(2).toString(10)})`);

    });
  });

});
