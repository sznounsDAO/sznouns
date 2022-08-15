import { task, types } from 'hardhat/config';
import ImageData from '../files/image-data.json';
import { chunkArray } from '../utils';

task('populate-descriptor', 'Populates the descriptor with color palettes and Noun parts')
  .addOptionalParam(
    'nftDescriptor',
    'The `NFTDescriptor` contract address',
    '0xabDC58A429F07ed2eE940113A4709214AB069043',
    types.string,
  )
  .addOptionalParam(
    'nounsDescriptor',
    'The `NounsDescriptor` contract address',
    '0x34a5a82EC82890026358a9b16EE10da62f29Ac13',
    types.string,
  )
  .setAction(async ({ nftDescriptor, nounsDescriptor }, { run, ethers }) => {
    const descriptorFactory = await ethers.getContractFactory('NounsDescriptor', {
      libraries: {
        NFTDescriptor: nftDescriptor,
      },
    });

    const { bgcolors, palette, images } = ImageData;
    const { bodies, accessories, heads, glasses } = images;

    const [deployer] = await ethers.getSigners();
    const pendingCount = await deployer.getTransactionCount('pending');

    const descriptorContract = descriptorFactory.connect(deployer).attach(nounsDescriptor);

    console.log('Pending tx count before adding many features:', pendingCount);

    console.log('deployer', deployer);

    await sleep(5000);

    // Chunk head and accessory population due to high gas usage
    // await descriptorContract.addManyBackgrounds(bgcolors);
    // await sleep(10000);

    // await descriptorContract.addManyColorsToPalette(0, palette);
    // await sleep(10000);
    
    // await descriptorContract.addManyBodies(bodies.map(({ data }) => data));
    // await sleep(10000);

    // const accessoryChunk = chunkArray(accessories, 10);
    // for (const chunk of accessoryChunk) {
    //   await descriptorContract.addManyAccessories(chunk.map(({ data }) => data));
    //   await sleep(10000);
    // }

    const headChunk = chunkArray(heads, 10);
    for (let i = 1; i < headChunk.length; i++) {
      console.log('ADDING HEAD CHUNK:', i);
      let chunk = headChunk[i];
      await descriptorContract.addManyHeads(chunk.map(({ data }) => data));
      await sleep(10000);
    }
    
    console.log('ADDING MANY GLASSES');
    await sleep(10000);
    await descriptorContract.addManyGlasses(glasses.map(({ data }) => data));

    console.log('Descriptor populated with palettes and parts.');
  });


function sleep(ms: any) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
