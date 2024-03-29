import { task, types } from 'hardhat/config';
import { ContractName, DeployedContract } from './types';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

task('update-configs', 'Write the deployed addresses to the SDK and subgraph configs')
  .addParam('contracts', 'Contract objects from the deployment', undefined, types.json)
  .setAction(
    async ({ contracts }: { contracts: Record<ContractName, DeployedContract> }, { ethers }) => {
      const { name: network, chainId } = await ethers.provider.getNetwork();

      const nounsSeederAddress = '0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515';

      // Update SDK addresses
      const sdkPath = join(__dirname, '../../nouns-sdk');
      const addressesPath = join(sdkPath, 'src/contract/addresses.json');
      const addresses = JSON.parse(readFileSync(addressesPath, 'utf8'));
      addresses[chainId] = {
        nounsToken: contracts.SZNounsToken.address,
        SZNounsToken: contracts.SZNounsToken.address,
        nounsSeeder: nounsSeederAddress,
        nounsDescriptor: contracts.NounsDescriptor.address,
        nftDescriptor: contracts.NFTDescriptor.address,
        nounsAuctionHouse: contracts.SZNounsAuctionHouse.address,
        SZNounsAuctionHouse: contracts.SZNounsAuctionHouse.address,
        nounsAuctionHouseProxy: contracts.NounsAuctionHouseProxy.address,
        nounsAuctionHouseProxyAdmin: contracts.NounsAuctionHouseProxyAdmin.address,
        nounsDaoExecutor: contracts.NounsDAOExecutor.address,
        nounsDAOProxy: contracts.NounsDAOProxy.address,
        nounsDAOLogicV1: contracts.NounsDAOLogicV1.address,
      };
      writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
      try {
        execSync('yarn build', {
          cwd: sdkPath,
        });
      } catch {
        console.log('Failed to re-build `@nouns/sdk`. Please rebuild manually.');
      }
      console.log('Addresses written to the Nouns SDK.');

      // Generate subgraph config
      const configName = `${network}-fork`;
      const subgraphConfigPath = join(__dirname, `../../nouns-subgraph/config/${configName}.json`);
      const subgraphConfig = {
        network,
        nounsToken: {
          address: contracts.SZNounsToken.address,
          startBlock: contracts.SZNounsToken.instance.deployTransaction.blockNumber,
        },
        nounsAuctionHouse: {
          address: contracts.NounsAuctionHouseProxy.address,
          startBlock: contracts.NounsAuctionHouseProxy.instance.deployTransaction.blockNumber,
        },
        nounsDAO: {
          address: contracts.NounsDAOProxy.address,
          startBlock: contracts.NounsDAOProxy.instance.deployTransaction.blockNumber,
        },
      };
      writeFileSync(subgraphConfigPath, JSON.stringify(subgraphConfig, null, 2));
      console.log('Subgraph config has been generated.');
    },
  );
