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
    // const contracts = await run('deploy', args);

    // // Verify the contracts on Etherscan
    // await run('verify-etherscan', {
    //   contracts,
    // });

    // console.log('Finished verifying contracts on Etherscan');

    // Populate the on-chain art
    await run('populate-descriptor', {
      // nftDescriptor: contracts.NFTDescriptor.address,
      // nounsDescriptor: contracts.NounsDescriptor.address,
      nftDescriptor: '0xabDC58A429F07ed2eE940113A4709214AB069043',
      nounsDescriptor: '0x34a5a82EC82890026358a9b16EE10da62f29Ac13',
    });

    await sleep(2500); // try waiting 2.5 seconds

    // start comment
    /**const [deployer] = await ethers.getSigners();
    const pendingCount = await deployer.getTransactionCount('pending');
    console.log('Pending tx count before transferring ownership:', pendingCount);

    // Transfer ownership of all contract except for the auction house.
    // We must maintain ownership of the auction house to kick off the first auction.
    // const executorAddress = contracts.NounsDAOExecutor.address;
    const executorAddress = '0xB18ec0bBa5457cafDA0e08aBf77f6cfb49b18b0e';

    // transfer ownership for nouns descriptor
    const nounsDescriptorFactory = await ethers.getContractFactory('NounsDescriptor');
    const nounsDescriptorContract = nounsDescriptorFactory.attach('0xFEe27Be8AfefDb557B3ace73C30d6F42e2A254c6');
    await nounsDescriptorContract.transferOwnership(executorAddress);

    await sleep(2500); // try waiting 2.5 seconds

    // transfer ownership for sznouns token 
    const sznounsTokenFactory = await ethers.getContractFactory('SZNounsToken');
    const sznounsTokenContract = sznounsTokenFactory.attach('0xFEe27Be8AfefDb557B3ace73C30d6F42e2A254c6');
    await sznounsTokenContract.transferOwnership(executorAddress);
    
    await sleep(2500); // try waiting 2.5 seconds

    // transfer ownership for auction house proxy admin
    const auctionHouseProxyAdminFactory = await ethers.getContractFactory('NounsAuctionHouseProxyAdmin');
    const auctionHouseProxyAdminContract = auctionHouseProxyAdminFactory.attach('0xFEe27Be8AfefDb557B3ace73C30d6F42e2A254c6');
    await auctionHouseProxyAdminContract.transferOwnership(executorAddress);

    await sleep(2500); // try waiting 2.5 seconds

    // initiate first auction
    const auctionHouseFactory = await ethers.getContractFactory('SZNounsAuctionHouse');
    const auctionHouseContract = auctionHouseFactory.attach('0x839e0c5Ae6bE8c4eC4DD23C2d55f703c2873D9Ed');
  
    await auctionHouseContract.unpause({
      gasLimit: 1_000_000,
    });
    await sleep(2500); // try waiting 2.5 seconds

    await auctionHouseContract.transferOwnership(executorAddress);
    console.log(
      'Started the first auction and transferred ownership of the auction house to the executor.',
    );

    console.log(
      'Transferred ownership of the descriptor, token, and proxy admin contracts to the executor.',
    );
    **/
   // end comment

    // Optionally kick off the first auction and transfer ownership of the auction house
    // to the Nouns DAO executor.
    // if (args.startAuction) {
    //   const auctionHouseFactory = await ethers.getContractFactory('SZNounsAuctionHouse');
    //   const auctionHouseContract = auctionHouseFactory.attach('0x839e0c5Ae6bE8c4eC4DD23C2d55f703c2873D9Ed');
      
    //   // const auctionHouse = contracts.SZNounsAuctionHouse.instance.attach(
    //   //   contracts.NounsAuctionHouseProxy.address,
    //   // );
    //   await auctionHouseContract.unpause({
    //     gasLimit: 1_000_000,
    //   });
    //   await auctionHouseContract.transferOwnership(executorAddress);
    //   console.log(
    //     'Started the first auction and transferred ownership of the auction house to the executor.',
    //   );
    // }

    // Optionally write the deployed addresses to the SDK and subgraph configs.
    // if (args.updateConfigs) {
    //   await run('update-configs', {
    //     contracts,
    //   });
    // }

    // console.table(
    //   Object.values<DeployedContract>(contracts).reduce(
    //     (acc: Record<string, ContractRow>, contract: DeployedContract) => {
    //       acc[contract.name] = {
    //         Address: contract.address,
    //       };
    //       if (contract.instance?.deployTransaction) {
    //         acc[contract.name]['Deployment Hash'] = contract.instance.deployTransaction.hash;
    //       }
    //       return acc;
    //     },
    //     {},
    //   ),
    // );
    console.log('Deployment Complete.');
  });

function sleep(ms: any) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
