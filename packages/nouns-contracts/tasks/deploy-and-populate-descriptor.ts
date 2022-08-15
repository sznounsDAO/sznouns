import { default as NounsAuctionHouseABI } from '../abi/contracts/NounsAuctionHouse.sol/NounsAuctionHouse.json';
import { default as SZNounsAuctionHouseABI } from '../abi/contracts/SZNounsAuctionHouse.sol/SZNounsAuctionHouse.json';
import { ChainId, ContractDeployment, ContractName, DeployedContract } from './types';
import { Interface } from 'ethers/lib/utils';
import { task, types } from 'hardhat/config';
import promptjs from 'prompt';

promptjs.colors = false;
promptjs.message = '> ';
promptjs.delimiter = '';

const proxyRegistries: Record<number, string> = {
  [ChainId.Mainnet]: '0xa5409ec958c83c3f309868babaca7c86dcb077c1', // verified
  [ChainId.Rinkeby]: '0xf57b2c51ded3a29e6891aba85459d600256cf317', // verified
};
const wethContracts: Record<number, string> = {
  [ChainId.Mainnet]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // verified
  [ChainId.Ropsten]: '0xc778417e063141139fce010982780140aa0cd5ab',
  [ChainId.Rinkeby]: '0xc778417e063141139fce010982780140aa0cd5ab', // verified
  [ChainId.Kovan]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
};

task('deploy-and-populate-descriptor', 'Deploys NFTDescriptor and NounsDescriptor')
  .addFlag('autoDeploy', 'Deploy all contracts without user interaction')
  .addOptionalParam('weth', 'The WETH contract address', "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", types.string)
  .addOptionalParam('sznoundersdao', 'The sznounders DAO contract address', undefined, types.string)
  .setAction(async (args, { ethers }) => {
    const network = await ethers.provider.getNetwork();
    const [deployer] = await ethers.getSigners();

    console.log('Current network:', network.name);
    console.log('Chain ID:', network.chainId);
    const pendingCount = await deployer.getTransactionCount('pending');
    console.log('Pending tx count:', pendingCount);

    // prettier-ignore
    const proxyRegistryAddress = proxyRegistries[network.chainId] ?? proxyRegistries[ChainId.Rinkeby];

    const sznoundersDAO = '0x7d28539fa2aC9D5D0Be29FE6C01d431718d2709a'; // mainnet
    const sznoundersNounsDAOSharedSafe = '0xc0F84e21b3CfB7cA13c926F383BB6bf96bca758e'; // mainnet

    if (!args.sznoundersdao) {
      console.log(
        `SZNounders DAO address not provided. Setting to deployer (${deployer.address})...`,
      );
      // args.sznoundersdao = deployer.address;
      args.sznoundersdao = sznoundersDAO;
    }
    if (!args.weth) {
      const deployedWETHContract = wethContracts[network.chainId];
      if (!deployedWETHContract) {
        throw new Error(
          `Can not auto-detect WETH contract on chain ${network.name}. Provide it with the --weth arg.`,
        );
      }
      args.weth = deployedWETHContract || 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    }

    const nonce = await deployer.getTransactionCount();
    const deployment: Record<ContractName, DeployedContract> = {} as Record<
      ContractName,
      DeployedContract
    >;

    // Use references to existing contracts
    // Mainnet and Rinkeby contracts respectively
    const NounsSeederAddress =
      network.chainId == 1
        ? '0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515'
        : '0x8D88a3DA5A4837b41e154BA7ed1E754d53E85b11';

    // Mainnet vs Rinkeby contracts
    const SZNoundersAddress =
      network.chainId == 1
        ? '0x7d28539fa2aC9D5D0Be29FE6C01d431718d2709a'
        : '0x87cF07E625ffDE6Bb51F7695ef92ef7Aa095F23C';

    const contracts: Record<ContractName, ContractDeployment> = {
      NFTDescriptor: {},
      NounsDescriptor: {
        libraries: () => ({
          NFTDescriptor: deployment.NFTDescriptor.address,
        }),
      },
    };

    for (const [name, contract] of Object.entries(contracts)) {
      let gasPrice = await ethers.provider.getGasPrice();
      if (!args.autoDeploy) {
        const gasInGwei = Math.round(Number(ethers.utils.formatUnits(gasPrice, 'gwei')));

        promptjs.start();

        const result = await promptjs.get([
          {
            properties: {
              gasPrice: {
                type: 'integer',
                required: true,
                description: 'Enter a gas price (gwei)',
                default: gasInGwei,
              },
            },
          },
        ]);
        gasPrice = ethers.utils.parseUnits(result.gasPrice.toString(), 'gwei');
      }

      const factory = await ethers.getContractFactory(name, {
        libraries: contract?.libraries?.(),
      });

      const deploymentGas = await factory.signer.estimateGas(
        factory.getDeployTransaction(
          ...(contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? []),
          {
            gasPrice,
          },
        ),
      );
      const deploymentCost = deploymentGas.mul(gasPrice);

      console.log(
        `Estimated cost to deploy ${name}: ${ethers.utils.formatUnits(
          deploymentCost,
          'ether',
        )} ETH`,
      );

      if (!args.autoDeploy) {
        const result = await promptjs.get([
          {
            properties: {
              confirm: {
                pattern: /^(DEPLOY|SKIP|EXIT)$/,
                description:
                  'Type "DEPLOY" to confirm, "SKIP" to skip this contract, or "EXIT" to exit.',
              },
            },
          },
        ]);
        if (result.operation === 'SKIP') {
          console.log(`Skipping ${name} deployment...`);
          continue;
        }
        if (result.operation === 'EXIT') {
          console.log('Exiting...');
          return;
        }
      }
      console.log(`Deploying ${name}...`);

      const deployedContract = await factory.deploy(
        ...(contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? []),
        {
          gasPrice,
        },
      );

      if (contract.waitForConfirmation) {
        await deployedContract.deployed();
      }

      deployment[name as ContractName] = {
        name,
        instance: deployedContract,
        address: deployedContract.address,
        constructorArguments: contract.args?.map(a => (typeof a === 'function' ? a() : a)) ?? [],
        libraries: contract?.libraries?.() ?? {},
      };

      contract.validateDeployment?.();

      console.log(`${name} contract deployed to ${deployedContract.address}`);
    }

    return deployment;
  });
