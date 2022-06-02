import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import chai from 'chai';
import { solidity } from 'ethereum-waffle';
import { constants } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import {
  MaliciousBidder__factory as MaliciousBidderFactory,
  SzNounsAuctionHouse,
  NounsDescriptor__factory as NounsDescriptorFactory,
  NounsToken,
  WETH,
} from '../typechain';
import { deployNounsToken, deployWeth, populateDescriptor } from './utils';

chai.use(solidity);
const { expect } = chai;

describe('szNounsAuctionHouse', () => {
  let nounsAuctionHouse: SzNounsAuctionHouse;
  let nounsToken: NounsToken;
  let weth: WETH;
  let deployer: SignerWithAddress;
  let noundersDAO: SignerWithAddress;
  let bidderA: SignerWithAddress;
  let bidderB: SignerWithAddress;
  let snapshotId: number;

  const TIME_BUFFER = 15 * 60;
  const RESERVE_PRICE = 2;
  const MIN_INCREMENT_BID_PERCENTAGE = 5;
  const DURATION = 60 * 60 * 24;

  async function deploy(deployer?: SignerWithAddress) {
    const auctionHouseFactory = await ethers.getContractFactory('szNounsAuctionHouse', deployer);
    return upgrades.deployProxy(auctionHouseFactory, [
      nounsToken.address,
      weth.address,
      TIME_BUFFER,
      RESERVE_PRICE,
      MIN_INCREMENT_BID_PERCENTAGE,
      DURATION,
    ]) as Promise<SzNounsAuctionHouse>;
  }

  before(async () => {
    [deployer, noundersDAO, bidderA, bidderB] = await ethers.getSigners();

    // Set evm timestamp to Wed Jan 01 5000 00:00:00 GMT+0000
    // (Jan 1, year 5000)
    await ethers.provider.send('evm_mine', [95617584000]);
    // TODO(szns) update to deploy szNounsToken
    nounsToken = await deployNounsToken(deployer, noundersDAO.address, deployer.address);
    weth = await deployWeth(deployer);
    nounsAuctionHouse = await deploy(deployer);

    const descriptor = await nounsToken.descriptor();

    await populateDescriptor(NounsDescriptorFactory.connect(descriptor, deployer));

    await nounsToken.setMinter(nounsAuctionHouse.address);
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });

  describe('new szns functionality', () => {
    it('should get the correct szn based on the current block timestamp', async () => {
      // All times in GMT
      const sznBounds = [
        // Winter early bound, Jan 01 5001
        [95649120000, 0],
        // Spring early bound, Mar 01 5001
        [95654217600, 1],
        // Summer early bound, May 01 5001
        [95659488000, 2],
        // Fall early bound, Aug 01 5001
        [95667436800, 3],
        // Winter early bound, Dec 01 5001
        [95677977600, 0],
        // Spring early bound, Mar 01 5002
        [95685753600, 1],
      ];

      let lastSzn;
      for (const [timestamp, szn] of sznBounds) {
        if (lastSzn != undefined) {
          await ethers.provider.send('evm_mine', [timestamp - 1]);
          expect(await nounsAuctionHouse.getSzn()).to.equal(lastSzn);
        }
        lastSzn = szn;
        await ethers.provider.send('evm_mine', [timestamp]);
        expect(await nounsAuctionHouse.getSzn()).to.equal(szn);
      }
    });

    it('should change returned duration of the new auction depending on the szn and values set by governance', async () => {
      const assertDuration = async (szn: number, expected: number) => {
        const actual = await nounsAuctionHouse.getSznDuration(szn);
        expect(actual.toNumber()).to.equal(expected);
      };

      // Before anything custom is set, default values are returned.
      await assertDuration(0, 48 * 60 * 60); // winter
      await assertDuration(1, 24 * 60 * 60); // spring
      await assertDuration(2, 12 * 60 * 60); // summer
      await assertDuration(3, 24 * 60 * 60); // fall

      // Setting a custom fall duration results in it being used
      // instead of the default
      const customDuration = 50000;
      await (await nounsAuctionHouse.setDuration(3, customDuration)).wait();
      await assertDuration(3, customDuration);

      // SZNs that don't have a custom duration set still return
      // the default.
      await assertDuration(1, 24 * 60 * 60);
    });
  });

  describe('legacy nouns functionality', () => {
    it('should revert if a second initialization is attempted', async () => {
      const tx = nounsAuctionHouse.initialize(
        nounsToken.address,
        weth.address,
        TIME_BUFFER,
        RESERVE_PRICE,
        MIN_INCREMENT_BID_PERCENTAGE,
        DURATION,
      );
      await expect(tx).to.be.revertedWith('Initializable: contract is already initialized');
    });

    it('should allow the noundersDAO to unpause the contract and create the first auction', async () => {
      const tx = await nounsAuctionHouse.unpause();
      await tx.wait();

      const auction = await nounsAuctionHouse.auction();
      expect(auction.startTime.toNumber()).to.be.greaterThan(0);
    });

    it('should revert if a user creates a bid for an inactive auction', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();
      const tx = nounsAuctionHouse.connect(bidderA).createBid(nounId.add(1), {
        value: RESERVE_PRICE,
      });

      await expect(tx).to.be.revertedWith('Noun not up for auction');
    });

    it('should revert if a user creates a bid for an expired auction', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      await ethers.provider.send('evm_increaseTime', [60 * 60 * 50]); // Add 50 hours

      const { nounId } = await nounsAuctionHouse.auction();
      const tx = nounsAuctionHouse.connect(bidderA).createBid(nounId, {
        value: RESERVE_PRICE,
      });

      await expect(tx).to.be.revertedWith('Auction expired');
    });

    it('should revert if a user creates a bid with an amount below the reserve price', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();
      const tx = nounsAuctionHouse.connect(bidderA).createBid(nounId, {
        value: RESERVE_PRICE - 1,
      });

      await expect(tx).to.be.revertedWith('Must send at least reservePrice');
    });

    it('should revert if a user creates a bid less than the min bid increment percentage', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();
      await nounsAuctionHouse.connect(bidderA).createBid(nounId, {
        value: RESERVE_PRICE * 50,
      });
      const tx = nounsAuctionHouse.connect(bidderB).createBid(nounId, {
        value: RESERVE_PRICE * 51,
      });

      await expect(tx).to.be.revertedWith(
        'Must send more than last bid by minBidIncrementPercentage amount',
      );
    });

    it('should refund the previous bidder when the following user creates a bid', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();
      await nounsAuctionHouse.connect(bidderA).createBid(nounId, {
        value: RESERVE_PRICE,
      });

      const bidderAPostBidBalance = await bidderA.getBalance();
      await nounsAuctionHouse.connect(bidderB).createBid(nounId, {
        value: RESERVE_PRICE * 2,
      });
      const bidderAPostRefundBalance = await bidderA.getBalance();

      expect(bidderAPostRefundBalance).to.equal(bidderAPostBidBalance.add(RESERVE_PRICE));
    });

    it('should cap the maximum bid griefing cost at 30K gas + the cost to wrap and transfer WETH', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();

      const maliciousBidderFactory = new MaliciousBidderFactory(bidderA);
      const maliciousBidder = await maliciousBidderFactory.deploy();

      const maliciousBid = await maliciousBidder
        .connect(bidderA)
        .bid(nounsAuctionHouse.address, nounId, {
          value: RESERVE_PRICE,
        });
      await maliciousBid.wait();

      const tx = await nounsAuctionHouse.connect(bidderB).createBid(nounId, {
        value: RESERVE_PRICE * 2,
        gasLimit: 1_000_000,
      });
      const result = await tx.wait();

      expect(result.gasUsed.toNumber()).to.be.lessThan(200_000);
      expect(await weth.balanceOf(maliciousBidder.address)).to.equal(RESERVE_PRICE);
    });

    it('should emit an `AuctionBid` event on a successful bid', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();
      const tx = nounsAuctionHouse.connect(bidderA).createBid(nounId, {
        value: RESERVE_PRICE,
      });

      await expect(tx)
        .to.emit(nounsAuctionHouse, 'AuctionBid')
        .withArgs(nounId, bidderA.address, RESERVE_PRICE, false);
    });

    it('should emit an `AuctionExtended` event if the auction end time is within the time buffer', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId, endTime } = await nounsAuctionHouse.auction();

      await ethers.provider.send('evm_setNextBlockTimestamp', [endTime.sub(60 * 5).toNumber()]); // Subtract 5 mins from current end time

      const tx = nounsAuctionHouse.connect(bidderA).createBid(nounId, {
        value: RESERVE_PRICE,
      });

      await expect(tx)
        .to.emit(nounsAuctionHouse, 'AuctionExtended')
        .withArgs(nounId, endTime.add(60 * 10));
    });

    it('should revert if auction settlement is attempted while the auction is still active', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();

      await nounsAuctionHouse.connect(bidderA).createBid(nounId, {
        value: RESERVE_PRICE,
      });
      const tx = nounsAuctionHouse.connect(bidderA).settleCurrentAndCreateNewAuction();

      await expect(tx).to.be.revertedWith("Auction hasn't completed");
    });

    it('should emit `AuctionSettled` and `AuctionCreated` events if all conditions are met', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();

      await nounsAuctionHouse.connect(bidderA).createBid(nounId, {
        value: RESERVE_PRICE,
      });

      await ethers.provider.send('evm_increaseTime', [60 * 60 * 50]); // Add 50 hours
      const tx = await nounsAuctionHouse.connect(bidderA).settleCurrentAndCreateNewAuction();

      const receipt = await tx.wait();
      const { timestamp } = await ethers.provider.getBlock(receipt.blockHash);

      const settledEvent = receipt.events?.find(e => e.event === 'AuctionSettled');
      const createdEvent = receipt.events?.find(e => e.event === 'AuctionCreated');

      expect(settledEvent?.args?.nounId).to.equal(nounId);
      expect(settledEvent?.args?.winner).to.equal(bidderA.address);
      expect(settledEvent?.args?.amount).to.equal(RESERVE_PRICE);

      expect(createdEvent?.args?.nounId).to.equal(nounId.add(1));
      expect(createdEvent?.args?.startTime).to.equal(timestamp);
      expect(createdEvent?.args?.endTime).to.equal(
        timestamp + (await nounsAuctionHouse.getDuration()).toNumber(),
      );
    });

    it('should not create a new auction if the auction house is paused and unpaused while an auction is ongoing', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      await (await nounsAuctionHouse.pause()).wait();

      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();

      expect(nounId).to.equal(1);
    });

    it('should create a new auction if the auction house is paused and unpaused after an auction is settled', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();

      await nounsAuctionHouse.connect(bidderA).createBid(nounId, {
        value: RESERVE_PRICE,
      });

      await ethers.provider.send('evm_increaseTime', [60 * 60 * 50]); // Add 50 hours

      await (await nounsAuctionHouse.pause()).wait();

      const settleTx = nounsAuctionHouse.connect(bidderA).settleAuction();

      await expect(settleTx)
        .to.emit(nounsAuctionHouse, 'AuctionSettled')
        .withArgs(nounId, bidderA.address, RESERVE_PRICE);

      const unpauseTx = await nounsAuctionHouse.unpause();
      const receipt = await unpauseTx.wait();
      const { timestamp } = await ethers.provider.getBlock(receipt.blockHash);

      const createdEvent = receipt.events?.find(e => e.event === 'AuctionCreated');

      expect(createdEvent?.args?.nounId).to.equal(nounId.add(1));
      expect(createdEvent?.args?.startTime).to.equal(timestamp);
      expect(createdEvent?.args?.endTime).to.equal(
        timestamp + (await nounsAuctionHouse.getDuration()).toNumber(),
      );
    });

    it('should settle the current auction and pause the contract if the minter is updated while the auction house is unpaused', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();

      await nounsAuctionHouse.connect(bidderA).createBid(nounId, {
        value: RESERVE_PRICE,
      });

      await nounsToken.setMinter(constants.AddressZero);

      await ethers.provider.send('evm_increaseTime', [60 * 60 * 50]); // Add 50 hours

      const settleTx = nounsAuctionHouse.connect(bidderA).settleCurrentAndCreateNewAuction();

      await expect(settleTx)
        .to.emit(nounsAuctionHouse, 'AuctionSettled')
        .withArgs(nounId, bidderA.address, RESERVE_PRICE);

      const paused = await nounsAuctionHouse.paused();

      expect(paused).to.equal(true);
    });

    it('should burn a Noun on auction settlement if no bids are received', async () => {
      await (await nounsAuctionHouse.unpause()).wait();

      const { nounId } = await nounsAuctionHouse.auction();

      await ethers.provider.send('evm_increaseTime', [60 * 60 * 50]); // Add 50 hours

      const tx = nounsAuctionHouse.connect(bidderA).settleCurrentAndCreateNewAuction();

      await expect(tx)
        .to.emit(nounsAuctionHouse, 'AuctionSettled')
        .withArgs(nounId, '0x0000000000000000000000000000000000000000', 0);
    });
  });
});
