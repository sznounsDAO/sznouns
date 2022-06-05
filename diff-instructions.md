# Instructions
See https://etherscan.io/txs?a=0xfd16f84e1f9bb5ec33b52d0133d61f7d20699658&p=2 for deployment order.

The FAQ is also a good place to get a high-level understanding of how Nouns are generated and how the protocol works.

The following are relevant addresses:
- Deployer: https://etherscan.io/address/0xfd16f84e1f9bb5ec33b52d0133d61f7d20699658
  - EOA for deploying Nouns-related contracts
- NFTDescriptor: https://etherscan.io/address/0x0bbad8c947210ab6284699605ce2a61780958264#code
  - A library used to construct ERC721 token URIs and SVG images
- NounsDescriptor: https://etherscan.io/address/0x0cfdb3ba1694c2bb2cfacb0339ad7b1ae5932b63#code
  - The Nouns NFT descriptor
- NounsSeeder: https://etherscan.io/address/0xcc8a0fb5ab3c7132c1b2a0109142fb112c4ce515#code
  - Generate a pseudo-random Noun seed using the previous blockhash and noun ID.
  - The Noun Seeder contract is used to determine Noun traits during the minting process. The seeder contract can be replaced to allow for future trait generation algorithm upgrades. Additionally, it can be locked by the Nouns DAO to prevent any future updates. Currently, Noun traits are determined using pseudo-random number generation: `keccak256(abi.encodePacked(blockhash(block.number - 1), nounId))`. Trait generation is not truly random. Traits can be predicted when minting a Noun on the pending block.
- NounsToken: https://etherscan.io/address/0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03#code
  - The Nouns ERC-721 token
- NounsAuctionHouse: https://etherscan.io/address/0x830bd73e4184cef73443c15111a1df14e495c706#code (third attempt)
  - The Nouns DAO auction house proxy
- NounsDAOExecutor: https://etherscan.io/address/0x0bc3807ec262cb779b38d65b38158acc3bfede10#code
  - The Nouns DAO executor and treasury
- NounsDAOLogicV1: https://etherscan.io/address/0xa43afe317985726e4e194eb061af77fbcb43f944#code
  - The Nouns DAO logic version 1 (Compound Governor Bravo Delegate)
- NounsDAOProxy: https://etherscan.io/address/0x6f3e6272a167e8accb32072d08e0957f9c79223d#code
  - The Nouns DAO proxy contract (Compound Governor Bravo Delegator)

For deployments, see `deploy.ts` and the like for deployment scripts.

The main bulk of the setup/running can be found here: https://github.com/nounsDAO/nouns-monorepo/blob/master/packages/nouns-webapp/README.md

## Diffs
- All links
  - Header: DAO, Docs, Discourse
  - Footer: Discord, Twitter, Etherscan, Forums
- FAQ
- Artwork
- Timing

## Breakdown of components
- nouns-api
- nouns-assets
- nouns-bots: non-critical
- nounts-contracts:
- nouns-sdk
- nouns-subgraph
- nouns-webapp

## Other features
- fomonouns, + other proposals
