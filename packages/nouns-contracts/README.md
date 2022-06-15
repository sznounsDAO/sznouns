# @nouns/contracts

## Background

SZNouns are an experimental attempt to improve the formation of on-chain avatar communities. While projects such as CryptoPunks have attempted to bootstrap digital community and identity, SZNouns attempt to bootstrap identity, community, governance and a treasury that can be used by the community for the creation of long-term value.

One SZNoun is generated and auctioned every day, forever. All SZNoun artwork is stored and rendered on-chain. See more information at [sznouns.wtf](https://sznouns.wtf/).

## Contracts

| Contract                                                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Address                                                                                                               |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [NounsToken](./contracts/NounsToken.sol)                        | This is the Nouns ERC721 Token contract. Unlike other Nouns contracts, it cannot be replaced or upgraded. Beyond the responsibilities of a standard ERC721 token, it is used to lock and replace periphery contracts, store checkpointing data required by our Governance contracts, and control Noun minting/burning. This contract contains two main roles - `minter` and `owner`. The `minter` will be set to the Nouns Auction House in the constructor and ownership will be transferred to the Nouns DAO following deployment.                                                                                                    | [0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03](https://etherscan.io/address/0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03) |
| [NounsSeeder](./contracts/NounsSeeder.sol)                      | This contract is used to determine Noun traits during the minting process. It can be replaced to allow for future trait generation algorithm upgrades. Additionally, it can be locked by the Nouns DAO to prevent any future updates. Currently, Noun traits are determined using pseudo-random number generation: `keccak256(abi.encodePacked(blockhash(block.number - 1), nounId))`. Trait generation is not truly random. Traits can be predicted when minting a Noun on the pending block.                                                                                                                                          | [0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515](https://etherscan.io/address/0xCC8a0FB5ab3C7132c1b2A0109142Fb112c4Ce515) |
| [NounsDescriptor](./contracts/NounsDescriptor.sol)              | This contract is used to store/render Noun artwork and build token URIs. Noun 'parts' are compressed in the following format before being stored in their respective byte arrays: `Palette Index, Bounds [Top (Y), Right (X), Bottom (Y), Left (X)] (4 Bytes), [Pixel Length (1 Byte), Color Index (1 Byte)][]`. When `tokenURI` is called, Noun parts are read from storage and converted into a series of SVG rects to build an SVG image on-chain. Once the entire SVG has been generated, it is base64 encoded. The token URI consists of base64 encoded data URI with the JSON contents directly inlined, including the SVG image. | [0x0Cfdb3Ba1694c2bb2CFACB0339ad7b1Ae5932B63](https://etherscan.io/address/0x0Cfdb3Ba1694c2bb2CFACB0339ad7b1Ae5932B63) |
| [NounsAuctionHouse](./contracts/NounsAuctionHouse.sol)          | This contract acts as a self-sufficient noun generation and distribution mechanism, auctioning one noun every 24 hours, forever. 100% of auction proceeds (ETH) are automatically deposited in the Nouns DAO treasury, where they are governed by noun owners. Each time an auction is settled, the settlement transaction will also cause a new noun to be minted and a new 24 hour auction to begin. While settlement is most heavily incentivized for the winning bidder, it can be triggered by anyone, allowing the system to trustlessly auction nouns as long as Ethereum is operational and there are interested bidders.       | [0xF15a943787014461d94da08aD4040f79Cd7c124e](https://etherscan.io/address/0xF15a943787014461d94da08aD4040f79Cd7c124e) |
| [NounsDAOExecutor](./contracts/governance/NounsDAOExecutor.sol) | This contract is a fork of Compound's `Timelock`. It acts as a timelocked treasury for the Nouns DAO. This contract is controlled by the governance contract (`NounsDAOProxy`).                                                                                                                                                                                                                                                                                                                                                                                                                                                         | [0x0BC3807Ec262cB779b38D65b38158acC3bfedE10](https://etherscan.io/address/0x0BC3807Ec262cB779b38D65b38158acC3bfedE10) |
| [NounsDAOProxy](./contracts/governance/NounsDAOProxy.sol)       | This contract is a fork of Compound's `GovernorBravoDelegator`. It can be used to create, vote on, and execute governance proposals.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | [0x6f3E6272A167e8AcCb32072d08E0957F9c79223d](https://etherscan.io/address/0x6f3E6272A167e8AcCb32072d08E0957F9c79223d) |
| [NounsDAOLogicV1](./contracts/governance/NounsDAOLogicV1.sol)   | This contract is a fork of Compound's `GovernorBravoDelegate`. It's the logic contract used by the `NounsDAOProxy`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | [0xa43aFE317985726E4e194eb061Af77fbCb43F944](https://etherscan.io/address/0xa43aFE317985726E4e194eb061Af77fbCb43F944) |

## Development

### Install dependencies

```sh
yarn
```

### Compile typescript, contracts, and generate typechain wrappers

```sh
yarn build
```

### Run tests

```sh
yarn test
```

### Environment Setup

Copy `.env.example` to `.env` and fill in fields

### Commands

```sh
# Compile Solidity
yarn build:sol

# Command Help
yarn task:[task-name] --help

# Deploy & Configure for Local Development (Hardhat)
yarn task:run-local

# Deploy & Configure (Testnet/Mainnet)
# This task deploys and verifies the contracts, populates the descriptor, and transfers contract ownership.
# For parameter and flag information, run `yarn task:deploy-and-configure --help`.
yarn task:deploy-and-configure --network [network] --update-configs --start-auction --auto-deploy
```

### Automated Testnet Deployments

The contracts are deployed to Rinkeby on each push to master and each PR using the account `0x387d301d92AE0a87fD450975e8Aef66b72fBD718`. This account's mnemonic is stored in GitHub Actions as a secret and is injected as the environment variable `MNEMONIC`. This mnemonic _shouldn't be considered safe for mainnet use_.

### Fresh builds/deployments
- `npx hardhat clean` - this is a preventative/cautionary measure that will help prevent any issues with builds (particularly during the contract verification step)
- `yarn build`
- `yarn generate-abi` if contracts have been updated
- Make deployment in `packages/nouns-contracts` via `yarn deploy:rinkeby` (see the appropriate `package.json` file to see all flags that are being used during deployment)
  - Note: automatic update within the `update-config` step may fail. In this case, it's important to manually verify/update the contract addresses is `nouns-sdk` to ensure accuracy. See https://github.com/NFTree/sznouns/commit/098da850ba61d471329aba88dd96a26ff5bd803d for an example.
  - Example: `yarn deploy:rinkeby`
- Save output from console (good practice would be to include in the PR description)
- Proceed to update subgraphs (see `nouns-subgraph/README.md`)

Sample console output upon completion:
┌─────────────────────────────┬──────────────────────────────────────────────┬──────────────────────────────────────────────────────────────────────┐
│           (index)           │                   Address                    │                           Deployment Hash                            │
├─────────────────────────────┼──────────────────────────────────────────────┼──────────────────────────────────────────────────────────────────────┤
│        NFTDescriptor        │ '0xdcb5595CfA4291156bA3a616004DbcE96168EE6C' │ '0xb2e1b9d8ef9f2e88a6e966b725a7b720db6d018c5fbe4d88a2e48ad2edd745b0' │
│       NounsDescriptor       │ '0x11e66c4E8359Cd39708420058E6990444501492C' │ '0xa8158554f8310a169d3471dfd1f6e0ba4357ee7f05803f81ce77fd8de81216d6' │
│        SZNounsToken         │ '0x63f9e083A76e396C45B5F6FCE41E6a91Ea0A1400' │ '0x8e7dd8d10755129ad57a4bcf1774cd623bfad5dcd3da5fecac3abbc90a72cfa1' │
│     SZNounsAuctionHouse     │ '0x5578e209ABD1e1A2Bdd3F364f881854E0445fcf0' │ '0x6fc7fcb06eae82c2681be832a7255bcee1eb0ad70a608989d19ddb65f99bf3ec' │
│ NounsAuctionHouseProxyAdmin │ '0x10D8A2ebF9Fb35B31BA754B795b61B81df364160' │ '0xef8776e9316f0375b5ab849b929486a4b94b31d6aea164d75dac5b1e4a39873b' │
│   NounsAuctionHouseProxy    │ '0x1FeB0f65cA8b13a3ba037169d6581a663655feFD' │ '0x73d0234746dad3703947f28be05dd06d511cd8c0ddd4955a5f534ceaacaf78b6' │
│      NounsDAOExecutor       │ '0x341EF007b4abaaadff203a5aedaf98184E32ABdA' │ '0xc8822048496a56ea6a70ef672389d078eafa8a6890c650719c2cf59500b6c022' │
│       NounsDAOLogicV1       │ '0xBCb7B3d0C4Ef9A8C9676b6e9335Be7Fe75F1DF90' │ '0xcc39b814954b7f205a43289ab5056b6edf52027e200b6dc0f5c32e175673fa35' │
│        NounsDAOProxy        │ '0x3BeF1eCd2347A19afB3335B39a74085bb8CEAe5c' │ '0xd74ac18225d50bc4f4011f6837acbf0fbaf9b32e4764ee8b3bbdb049e2c21f55' │
└─────────────────────────────┴──────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘