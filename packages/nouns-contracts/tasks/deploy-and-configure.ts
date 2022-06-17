import { task } from 'hardhat/config';
import { DeployedContract } from './types';

interface ContractRow {
  Address: string;
  'Deployment Hash'?: string;
}

task('deploy-and-configure', 'Deploy and configure all contracts')
  .addFlag('startAuction', 'Start the first auction upon deployment completion')
  .addFlag('autoDeploy', 'Deploy all contracts without user interaction')
  .addFlag('updateConfigs', 'Write the deployed addresses to the SDK and subgraph configs')
  .addOptionalParam('weth', 'The WETH contract address')
  .addOptionalParam('sznoundersdao', 'The SZNounders DAO contract address')
  .addOptionalParam('auctionTimeBuffer', 'The auction time buffer (seconds)')
  .addOptionalParam('auctionReservePrice', 'The auction reserve price (wei)')
  .addOptionalParam(
    'auctionMinIncrementBidPercentage',
    'The auction min increment bid percentage (out of 100)',
  )
  .addOptionalParam('auctionDuration', 'The auction duration (seconds)')
  .addOptionalParam('timelockDelay', 'The timelock delay (seconds)')
  .addOptionalParam('votingPeriod', 'The voting period (blocks)')
  .addOptionalParam('votingDelay', 'The voting delay (blocks)')
  .addOptionalParam('proposalThresholdBps', 'The proposal threshold (basis points)')
  .addOptionalParam('quorumVotesBps', 'Votes required for quorum (basis points)')
  .setAction(async (args, { run, ethers }) => {
    // Deploy the Nouns DAO contracts and return deployment information
    const contracts = await run('deploy', args);

    // Verify the contracts on Etherscan
    await run('verify-etherscan', {
      contracts,
    });

    console.log('Finished verifying contracts on Etherscan');

    // Populate the on-chain art
    await run('populate-descriptor', {
      nftDescriptor: contracts.NFTDescriptor.address,
      nounsDescriptor: contracts.NounsDescriptor.address,
    });

    await sleep(2500); // try waiting 2.5 seconds

    const [deployer] = await ethers.getSigners();
    const pendingCount = await deployer.getTransactionCount('pending');
    console.log('Pending tx count before transferring ownership:', pendingCount);

    // Transfer ownership of all contract except for the auction house.
    // We must maintain ownership of the auction house to kick off the first auction.
    const executorAddress = contracts.NounsDAOExecutor.address;
    await contracts.NounsDescriptor.instance.transferOwnership(executorAddress);
    await contracts.SZNounsToken.instance.transferOwnership(executorAddress);
    await contracts.NounsAuctionHouseProxyAdmin.instance.transferOwnership(executorAddress);

    await sleep(5000); // try waiting 5 seconds

    console.log(
      'Transferred ownership of the descriptor, token, and proxy admin contracts to the executor.',
    );

    // Optionally kick off the first auction and transfer ownership of the auction house
    // to the Nouns DAO executor.
    if (args.startAuction) {
      const auctionHouse = contracts.SZNounsAuctionHouse.instance.attach(
        contracts.NounsAuctionHouseProxy.address,
      );
      await auctionHouse.unpause({
        gasLimit: 1_000_000,
      });
      await auctionHouse.transferOwnership(executorAddress);
      console.log(
        'Started the first auction and transferred ownership of the auction house to the executor.',
      );
    }

    // Optionally write the deployed addresses to the SDK and subgraph configs.
    if (args.updateConfigs) {
      await run('update-configs', {
        contracts,
      });
    }

    console.table(
      Object.values<DeployedContract>(contracts).reduce(
        (acc: Record<string, ContractRow>, contract: DeployedContract) => {
          acc[contract.name] = {
            Address: contract.address,
          };
          if (contract.instance?.deployTransaction) {
            acc[contract.name]['Deployment Hash'] = contract.instance.deployTransaction.hash;
          }
          return acc;
        },
        {},
      ),
    );
    console.log('Deployment Complete.');
  });

function sleep(ms: any) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
