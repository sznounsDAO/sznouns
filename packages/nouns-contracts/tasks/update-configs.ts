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
        nounsToken: '0xFEe27Be8AfefDb557B3ace73C30d6F42e2A254c6',
        SZNounsToken: '0xFEe27Be8AfefDb557B3ace73C30d6F42e2A254c6',
        nounsSeeder: nounsSeederAddress,
        nounsDescriptor: '0x34a5a82EC82890026358a9b16EE10da62f29Ac13',
        nftDescriptor: '0xabDC58A429F07ed2eE940113A4709214AB069043',
        nounsAuctionHouse: '0x46717397132a679fCc6b54084e8Ac7237802b067',
        SZNounsAuctionHouse: '0x46717397132a679fCc6b54084e8Ac7237802b067',
        nounsAuctionHouseProxy: '0x839e0c5Ae6bE8c4eC4DD23C2d55f703c2873D9Ed',
        nounsAuctionHouseProxyAdmin: '0x89aee60b6dDbA003B879ACEd185101A466082769',
        nounsDaoExecutor: '0xB18ec0bBa5457cafDA0e08aBf77f6cfb49b18b0e',
        nounsDAOProxy: '0x55F102413f0Bf95f8d404036226db2A24963053A',
        nounsDAOLogicV1: '0xBE10813E4a7F656b1A67b488FD91274dF68F03FB',
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
          address: '0xFEe27Be8AfefDb557B3ace73C30d6F42e2A254c6',
          startBlock: 14981572,
        },
        nounsAuctionHouse: {
          address: '0x839e0c5Ae6bE8c4eC4DD23C2d55f703c2873D9Ed',
          startBlock: 14981573,
        },
        nounsDAO: {
          address: '0x55F102413f0Bf95f8d404036226db2A24963053A',
          startBlock: 14981576,
        },
      };
      writeFileSync(subgraphConfigPath, JSON.stringify(subgraphConfig, null, 2));
      console.log('Subgraph config has been generated.');
    },
  );
  