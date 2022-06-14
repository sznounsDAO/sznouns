import chai from 'chai';
import { ethers } from 'hardhat';
import { BigNumber as EthersBN, constants } from 'ethers';
import { solidity } from 'ethereum-waffle';
import { NounsDescriptor__factory as NounsDescriptorFactory, SZNounsToken } from '../typechain';
import { deploySZNounsToken, populateDescriptor } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(solidity);
const { expect } = chai;

describe('SZNounsToken', () => {
  let nounsToken: SZNounsToken;
  let deployer: SignerWithAddress;
  let noundersDAO: SignerWithAddress;
  let snapshotId: number;

  // Random placeholder addresses.
  const nounsDAO: string = '0x42EB768f2244C8811C63729A21A3569731535f06';

  before(async () => {
    [deployer, noundersDAO] = await ethers.getSigners();
    nounsToken = await deploySZNounsToken(
      deployer,
      noundersDAO.address,
      deployer.address,
      nounsDAO,
    );

    const descriptor = await nounsToken.descriptor();

    await populateDescriptor(NounsDescriptorFactory.connect(descriptor, deployer));
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  });

  afterEach(async () => {
    await ethers.provider.send('evm_revert', [snapshotId]);
  });

  describe('new sznouns functionality', () => {
    it('should mint nounders, nouns dao rewards', async () => {
      const assertBalances = async (expectedNoundersDAO: number, expectedNounsDAO: number) => {
        const noundersBalance = await nounsToken.balanceOf(noundersDAO.address);
        expect(noundersBalance.toNumber()).to.equal(expectedNoundersDAO);

        const nounsBalance = await nounsToken.balanceOf(nounsDAO);
        expect(nounsBalance.toNumber()).to.equal(expectedNounsDAO);
      };

      await assertBalances(0, 0);
      await (await nounsToken.mint()).wait();
      await assertBalances(1, 1);
      // Up through szNoun 19 minted, these balances stay the same.
      for (let i = 3; i < 20; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(1, 1);
      // Minting szNoun 20 triggers some rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(2, 2);

      // Up through szNoun 39 minted, these balances stay the same.
      for (let i = 23; i < 40; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(2, 2);
      // Minting szNoun 40 triggers some rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(3, 3);

      // Up through szNoun 49 minted, these balances stay the same.
      for (let i = 43; i < 50; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(3, 3);
      // Minting szNoun 50 does not trigger rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(3, 3);

      // Up through szNoun 59 minted, these balances stay the same.
      for (let i = 51; i < 60; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(3, 3);
      // Minting szNoun 60 triggers some rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(4, 4);

      // Up through szNoun 79 minted, these balances stay the same.
      for (let i = 63; i < 80; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(4, 4);
      // Minting szNoun 80 triggers some rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(5, 5);

      // Up through szNoun 99 minted, these balances stay the same.
      for (let i = 83; i < 100; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(5, 5);
      // Minting szNoun 100 triggers some rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(6, 6);
    });
  });

  describe('legacy nouns functionality', () => {
    it('should allow the minter to mint a noun to itself and rewards to the relevant parties', async () => {
      const receipt = await (await nounsToken.mint()).wait();

      const [, , , noundersNounCreated, , , , nounsNounCreated, , , , ownersNounCreated] =
        receipt.events || [];

      expect(await nounsToken.ownerOf(0)).to.eq(noundersDAO.address);
      expect(noundersNounCreated?.event).to.eq('NounCreated');
      expect(noundersNounCreated?.args?.tokenId).to.eq(0);
      expect(noundersNounCreated?.args?.seed.length).to.equal(5);

      expect(await nounsToken.ownerOf(1)).to.eq(nounsDAO);
      expect(nounsNounCreated?.event).to.eq('NounCreated');
      expect(nounsNounCreated?.args?.tokenId).to.eq(1);
      expect(nounsNounCreated?.args?.seed.length).to.equal(5);

      expect(await nounsToken.ownerOf(2)).to.eq(deployer.address);
      expect(ownersNounCreated?.event).to.eq('NounCreated');
      expect(ownersNounCreated?.args?.tokenId).to.eq(2);
      expect(ownersNounCreated?.args?.seed.length).to.equal(5);

      noundersNounCreated?.args?.seed.forEach((item: EthersBN | number) => {
        const value = typeof item !== 'number' ? item?.toNumber() : item;
        expect(value).to.be.a('number');
      });

      nounsNounCreated?.args?.seed.forEach((item: EthersBN | number) => {
        const value = typeof item !== 'number' ? item?.toNumber() : item;
        expect(value).to.be.a('number');
      });

      ownersNounCreated?.args?.seed.forEach((item: EthersBN | number) => {
        const value = typeof item !== 'number' ? item?.toNumber() : item;
        expect(value).to.be.a('number');
      });
    });

    it('should set symbol', async () => {
      expect(await nounsToken.symbol()).to.eq('SZNOUN');
    });

    it('should set name', async () => {
      expect(await nounsToken.name()).to.eq('SZNouns');
    });

    it('should allow minter to mint a noun to itself', async () => {
      // Get initial mint + rewards out of the way.
      await (await nounsToken.mint()).wait();

      const receipt = await (await nounsToken.mint()).wait();
      const nounCreated = receipt.events?.[3];

      expect(await nounsToken.ownerOf(3)).to.eq(deployer.address);
      expect(nounCreated?.event).to.eq('NounCreated');
      expect(nounCreated?.args?.tokenId).to.eq(3);
      expect(nounCreated?.args?.seed.length).to.equal(5);

      nounCreated?.args?.seed.forEach((item: EthersBN | number) => {
        const value = typeof item !== 'number' ? item?.toNumber() : item;
        expect(value).to.be.a('number');
      });
    });

    it('should emit two transfer logs on mint', async () => {
      const [, , creator, minter] = await ethers.getSigners();

      await (await nounsToken.mint()).wait();

      await (await nounsToken.setMinter(minter.address)).wait();
      await (await nounsToken.transferOwnership(creator.address)).wait();

      const tx = nounsToken.connect(minter).mint();

      await expect(tx)
        .to.emit(nounsToken, 'Transfer')
        .withArgs(constants.AddressZero, creator.address, 3);
      await expect(tx).to.emit(nounsToken, 'Transfer').withArgs(creator.address, minter.address, 3);
    });

    it('should allow minter to burn a noun', async () => {
      await (await nounsToken.mint()).wait();

      const tx = nounsToken.burn(0);
      await expect(tx).to.emit(nounsToken, 'NounBurned').withArgs(0);
    });

    it('should revert on non-minter mint', async () => {
      const account0AsNounErc721Account = nounsToken.connect(noundersDAO);
      await expect(account0AsNounErc721Account.mint()).to.be.reverted;
    });

    describe('contractURI', async () => {
      it('should return correct contractURI', async () => {
        expect(await nounsToken.contractURI()).to.eq(
          'ipfs://QmZi1n79FqWt2tTLwCqiy6nLM6xLGRsEPQ5JmReJQKNNzX',
        );
      });
      it('should allow owner to set contractURI', async () => {
        await nounsToken.setContractURIHash('ABC123');
        expect(await nounsToken.contractURI()).to.eq('ipfs://ABC123');
      });
      it('should not allow non owner to set contractURI', async () => {
        const [, nonOwner] = await ethers.getSigners();
        await expect(nounsToken.connect(nonOwner).setContractURIHash('BAD')).to.be.revertedWith(
          'Ownable: caller is not the owner',
        );
      });
    });
  });
});
