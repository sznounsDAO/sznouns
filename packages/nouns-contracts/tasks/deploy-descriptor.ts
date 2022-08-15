import { task } from 'hardhat/config';
import { ContractName, DeployedContract } from './types';
import { printContractsTable } from './utils';

async function delay(seconds: number) {
  return new Promise(resolve => setTimeout(resolve, 1000 * seconds));
}

task('deploy-descriptor', 'Deploy NounsDescriptor').setAction(
  async (args, { ethers, run, network }) => {
    const contracts: Record<ContractName, DeployedContract> = {} as Record<
      ContractName,
      DeployedContract
    >;
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying from address ${deployer.address}`);

    console.log('Deploying contracts...');
    const library = await (await ethers.getContractFactory('NFTDescriptor', deployer)).deploy();

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

    const nounsDescriptor = await nounsDescriptorFactory.deploy();

    contracts.NounsDescriptor = {
      name: 'NounsDescriptor',
      address: nounsDescriptor.address,
      constructorArguments: [],
      instance: nounsDescriptor,
      libraries: {
        NFTDescriptor: library.address,
      },
    };

    for (const c of Object.values<DeployedContract>(contracts)) {
      console.log(`Waiting for ${c.name} to be deployed`);
      await c.instance.deployTransaction.wait();
      console.log('Done');
    }

    console.log('Deployment complete:');
    printContractsTable(contracts);

    if (network.name !== 'localhost') {
      console.log('Waiting 1 minute before verifying contracts on Etherscan');
      await delay(60);

      console.log('Verifying contracts on Etherscan...');
      await run('verify-etherscan', {
        contracts,
      });
      console.log('Verify complete.');
    }
  },
);

task('verify-descriptor', 'Verify NounsDescriptor').setAction(
  async (args, { ethers, run, network }) => {
    const contracts: Record<ContractName, DeployedContract> = {} as Record<
      ContractName,
      DeployedContract
    >;
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying from address ${deployer.address}`);

    console.log('Deploying contracts...');
    const library = await (await ethers.getContractFactory('NFTDescriptor', deployer)).deploy();

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

    const nounsDescriptor = await nounsDescriptorFactory.deploy();

    contracts.NounsDescriptor = {
      name: 'NounsDescriptor',
      address: nounsDescriptor.address,
      constructorArguments: [],
      instance: nounsDescriptor,
      libraries: {
        NFTDescriptor: library.address,
      },
    };

    for (const c of Object.values<DeployedContract>(contracts)) {
      console.log(`Waiting for ${c.name} to be deployed`);
      await c.instance.deployTransaction.wait();
      console.log('Done');
    }

    console.log('Deployment complete:');
    printContractsTable(contracts);

    if (network.name !== 'localhost') {
      console.log('Waiting 1 minute before verifying contracts on Etherscan');
      await delay(60);

      console.log('Verifying contracts on Etherscan...');
      await run('verify-etherscan', {
        contracts,
      });
      console.log('Verify complete.');
    }
  },
);

task('etherscan-verify', 'Verifies on etherscan', async (_, hre) => {
  console.log('Verifying contract on etherscan...');
  await hre.run('verify:verify', {
    address: '0x1E3C6f5596FB011a46aC8c3A525583A092E96822',
    constructorArguments: [],
  });
  await hre.run('verify:verify', {
    address: '0x60446f84d3F26Ed6dE22e69BeE54fC75e419ed47',
    constructorArguments: [],
  });
});

task('populate-deployed-descriptor', 'Deploy NounsDescriptor').setAction(async (args, { run }) => {
  console.log('Populating Descriptor...');
  await run('populate-descriptor', {
    nftDescriptor: '0x1E3C6f5596FB011a46aC8c3A525583A092E96822',
    nounsDescriptor: '0x60446f84d3F26Ed6dE22e69BeE54fC75e419ed47',
  });
  console.log('Population complete.');
});

task('transfer-deployed-descriptor', 'Deploy NounsDescriptor').setAction(
  async (args, { ethers, run, network }) => {
    const nounsDescriptorFactory = await ethers.getContractFactory('NounsDescriptor', {
      libraries: {
        NFTDescriptor: '0x1E3C6f5596FB011a46aC8c3A525583A092E96822',
      },
    });

    const nounsDescriptor = await nounsDescriptorFactory.attach(
      '0x60446f84d3F26Ed6dE22e69BeE54fC75e419ed47',
    );
    console.log('nounsDescriptor attached to:', nounsDescriptor.address);

    console.log('Transfering ownership to DAO Executor...');
    await nounsDescriptor.transferOwnership('0x2c2C5aE2C37d19F793ece49138D0d1802fA427b4');
    console.log('Transfer complete.');
  },
);
