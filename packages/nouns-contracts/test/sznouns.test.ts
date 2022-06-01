import chai from 'chai';
import { ethers } from 'hardhat';
import { BigNumber as EthersBN, constants } from 'ethers';
import { solidity } from 'ethereum-waffle';
import { NounsDescriptor__factory as NounsDescriptorFactory, SzNounsToken } from '../typechain';
import { deploySzNounsToken, populateDescriptor } from './utils';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

chai.use(solidity);
const { expect } = chai;

describe('szNounsToken', () => {
  let nounsToken: SzNounsToken;
  let deployer: SignerWithAddress;
  let noundersDAO: SignerWithAddress;
  let snapshotId: number;

  // Random placeholder addresses.
  const nounsDAO: string = '0x42EB768f2244C8811C63729A21A3569731535f06';
  const sznsDAO: string = '0x890c5252337E109e387B59939efafC605F9687AF';

  before(async () => {
    [deployer, noundersDAO] = await ethers.getSigners();
    nounsToken = await deploySzNounsToken(
      deployer,
      noundersDAO.address,
      deployer.address,
      nounsDAO,
      sznsDAO,
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
    it('should mint nounders, nouns, and szns dao rewards', async () => {
      const assertBalances = async (
        expectedNoundersDAO: number,
        expectedNounsDAO: number,
        expectedSznsDAO: number,
      ) => {
        const noundersBalance = await nounsToken.balanceOf(noundersDAO.address);
        expect(noundersBalance.toNumber()).to.equal(expectedNoundersDAO);

        const nounsBalance = await nounsToken.balanceOf(nounsDAO);
        expect(nounsBalance.toNumber()).to.equal(expectedNounsDAO);

        const sznsBalance = await nounsToken.balanceOf(sznsDAO);
        expect(sznsBalance.toNumber()).to.equal(expectedSznsDAO);
      };

      await assertBalances(0, 0, 0);
      await (await nounsToken.mint()).wait();
      await assertBalances(1, 1, 1);
      // Up through szNoun 20 minted, these balances stay the same.
      for (let i = 4; i < 21; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(1, 1, 1);
      // Minting szNoun 21 triggers some rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(1, 2, 2);

      // Up through szNoun 40 minted, these balances stay the same.
      for (let i = 24; i < 41; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(1, 2, 2);
      // Minting szNoun 41 triggers some rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(1, 3, 3);

      // Up through szNoun 49 minted, these balances stay the same.
      for (let i = 44; i < 50; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(1, 3, 3);
      // Minting szNoun 50 triggers some rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(2, 3, 3);

      // Up through szNoun 60 minted, these balances stay the same.
      for (let i = 52; i < 61; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(2, 3, 3);
      // Minting szNoun 61 triggers some rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(2, 4, 4);

      // Up through szNoun 80 minted, these balances stay the same.
      for (let i = 64; i < 81; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(2, 4, 4);
      // Minting szNoun 81 triggers some rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(2, 5, 5);

      // Up through szNoun 99 minted, these balances stay the same.
      for (let i = 84; i < 100; i++) {
        await (await nounsToken.mint()).wait();
      }
      await assertBalances(2, 5, 5);
      // Minting szNoun 100 triggers some rewards.
      await (await nounsToken.mint()).wait();
      await assertBalances(3, 6, 6);
    });
  });

  describe('legacy nouns functionality', () => {
    it('should allow the minter to mint a noun to itself and rewards to the relevant parties', async () => {
      const receipt = await (await nounsToken.mint()).wait();

      const [
        ,
        ,
        ,
        noundersNounCreated,
        ,
        ,
        ,
        nounsNounCreated,
        ,
        ,
        ,
        sznsNounCreated,
        ,
        ,
        ,
        ownersNounCreated,
      ] = receipt.events || [];

      expect(await nounsToken.ownerOf(0)).to.eq(noundersDAO.address);
      expect(noundersNounCreated?.event).to.eq('NounCreated');
      expect(noundersNounCreated?.args?.tokenId).to.eq(0);
      expect(noundersNounCreated?.args?.seed.length).to.equal(5);

      expect(await nounsToken.ownerOf(1)).to.eq(nounsDAO);
      expect(nounsNounCreated?.event).to.eq('NounCreated');
      expect(nounsNounCreated?.args?.tokenId).to.eq(1);
      expect(nounsNounCreated?.args?.seed.length).to.equal(5);

      expect(await nounsToken.ownerOf(2)).to.eq(sznsDAO);
      expect(sznsNounCreated?.event).to.eq('NounCreated');
      expect(sznsNounCreated?.args?.tokenId).to.eq(2);
      expect(sznsNounCreated?.args?.seed.length).to.equal(5);

      expect(await nounsToken.ownerOf(3)).to.eq(deployer.address);
      expect(ownersNounCreated?.event).to.eq('NounCreated');
      expect(ownersNounCreated?.args?.tokenId).to.eq(3);
      expect(ownersNounCreated?.args?.seed.length).to.equal(5);

      noundersNounCreated?.args?.seed.forEach((item: EthersBN | number) => {
        const value = typeof item !== 'number' ? item?.toNumber() : item;
        expect(value).to.be.a('number');
      });

      nounsNounCreated?.args?.seed.forEach((item: EthersBN | number) => {
        const value = typeof item !== 'number' ? item?.toNumber() : item;
        expect(value).to.be.a('number');
      });

      sznsNounCreated?.args?.seed.forEach((item: EthersBN | number) => {
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
      expect(await nounsToken.name()).to.eq('szNouns');
    });

    it('should allow minter to mint a noun to itself', async () => {
      // Get initial mint + rewards out of the way.
      await (await nounsToken.mint()).wait();

      const receipt = await (await nounsToken.mint()).wait();
      const nounCreated = receipt.events?.[3];

      expect(await nounsToken.ownerOf(4)).to.eq(deployer.address);
      expect(nounCreated?.event).to.eq('NounCreated');
      expect(nounCreated?.args?.tokenId).to.eq(4);
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
        .withArgs(constants.AddressZero, creator.address, 4);
      await expect(tx).to.emit(nounsToken, 'Transfer').withArgs(creator.address, minter.address, 4);
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
