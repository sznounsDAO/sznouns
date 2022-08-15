import { task, types } from 'hardhat/config';
import ImageData from '../files/image-data.json';
import { chunkArray } from '../utils';

task('populate-descriptor', 'Populates the descriptor with color palettes and Noun parts')
  .addOptionalParam(
    'nftDescriptor',
    'The `NFTDescriptor` contract address',
    '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    types.string,
  )
  .addOptionalParam(
    'nounsDescriptor',
    'The `NounsDescriptor` contract address',
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    types.string,
  )
  .setAction(async ({ nftDescriptor, nounsDescriptor }, { ethers }) => {
    const descriptorFactory = await ethers.getContractFactory('NounsDescriptor', {
      libraries: {
        NFTDescriptor: nftDescriptor,
      },
    });
    const descriptorContract = descriptorFactory.attach(nounsDescriptor);

    const { bgcolors, palette, images } = ImageData;
    const { bodies, accessories, heads, glasses } = images;

    const [deployer] = await ethers.getSigners();
    const currentCount = await deployer.getTransactionCount();
    console.log('Current tx count:', currentCount);
    const pendingCount = await deployer.getTransactionCount('pending');
    console.log('Pending tx count before adding many features:', pendingCount);

    let nonceToUse = currentCount + pendingCount;

    // Chunk head and accessory population due to high gas usage
    await descriptorContract.addManyBackgrounds(bgcolors, { nonce: nonceToUse++ });
    await descriptorContract.addManyColorsToPalette(0, palette, { nonce: nonceToUse++ });
    await descriptorContract.addManyBodies(bodies.map(({ data }) => data), { nonce: nonceToUse++ });

    const accessoryChunk = chunkArray(accessories, 10);
    for (const chunk of accessoryChunk) {
      await descriptorContract.addManyAccessories(chunk.map(({ data }) => data), { nonce: nonceToUse++ });
      await sleep(500);
    }

    const headChunk = chunkArray(heads, 10);
    for (const chunk of headChunk) {
      await descriptorContract.addManyHeads(chunk.map(({ data }) => data), { nonce: nonceToUse++ });
      await sleep(500);
    }

    await descriptorContract.addManyGlasses(glasses.map(({ data }) => data), { nonce: nonceToUse++ });

    console.log('Descriptor populated with palettes and parts.');
  });


function sleep(ms: any) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
