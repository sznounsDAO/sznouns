import { task } from 'hardhat/config';
import { ContractName, DeployedContract } from './types';
import { printContractsTable } from './utils';

async function delay(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, 1000 * seconds));
}

task('deploy-and-populate-descriptor-v2', 'Deploy NounsDescriptor & populate it with art')
  .addParam(
    'daoExecutor',
    'The address of the NounsDAOExecutor that should be the owner of the descriptor.',
  )
  .setAction(async ({ daoExecutor }, { ethers, run, network }) => {
    const contracts: Record<ContractName, DeployedContract> = {} as Record<
      ContractName,
      DeployedContract
    >;
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying from address ${deployer.address}`);

    const nonce = await deployer.getTransactionCount();
    const expectedNounsArtAddress = ethers.utils.getContractAddress({
      from: deployer.address,
      nonce: nonce + 4,
    });

    console.log('Deploying contracts...');
    const library = await (await ethers.getContractFactory('NFTDescriptor`', deployer)).deploy();
    contracts.NFTDescriptor = {
      name: 'NFTDescriptor',
      address: library.address,
      instance: library,
      constructorArguments: [],
      libraries: {},
    };

    const nounsDescriptorFactory = await ethers.getContractFactory('NounsDescriptor', {
      libraries: {
        NFTDescriptor: library.address,
      },
    });
    const nounsDescriptor = await nounsDescriptorFactory.deploy(
      expectedNounsArtAddress,
      renderer.address,
    );
    contracts.NounsDescriptor = {
      name: 'NounsDescriptor',
      address: nounsDescriptor.address,
      constructorArguments: [expectedNounsArtAddress, renderer.address],
      instance: nounsDescriptor,
      libraries: {
        NFTDescriptor: library.address,
      },
    };

    console.log('Waiting for contracts to be deployed');
    for (const c of Object.values<DeployedContract>(contracts)) {
      console.log(`Waiting for ${c.name} to be deployed`);
      await c.instance.deployTransaction.wait();
      console.log('Done');
    }

    console.log('Deployment complete:');
    printContractsTable(contracts);

    console.log('Populating Descriptor...');
    await run('populate-descriptor', {
      nftDescriptor: contracts.NFTDescriptorV2.address,
      nounsDescriptor: contracts.NounsDescriptorV2.address,
    });
    console.log('Population complete.');

    console.log('Transfering ownership to DAO Executor...');
    await nounsDescriptor.transferOwnership(daoExecutor);
    console.log('Transfer complete.');

    if (network.name !== 'localhost') {
      console.log('Waiting 1 minute before verifying contracts on Etherscan');
      await delay(60);

      console.log('Verifying contracts on Etherscan...');
      await run('verify-etherscan', {
        contracts,
      });
      console.log('Verify complete.');
    }
  });
