# nouns-monorepo

Nouns DAO is a generative avatar art collective run by a group of crypto misfits.

## Contributing

If you're interested in contributing to Nouns DAO repos we're excited to have you. Please discuss any changes in `#developers` in [discord.gg/nouns](https://discord.gg/nouns) prior to contributing to reduce duplication of effort and in case there is any prior art that may be useful to you.

## Packages

### nouns-api

The [nouns api](packages/nouns-api) is an HTTP webserver that hosts token metadata. This is currently unused because on-chain, data URIs are enabled.

### nouns-assets

The [nouns assets](packages/nouns-assets) package holds the Noun PNG and run-length encoded image data.

### nouns-bots

The [nouns bots](packages/nouns-bots) package contains a bot that monitors for changes in Noun auction state and notifies everyone via Twitter and Discord.

### nouns-contracts

The [nouns contracts](packages/nouns-contracts) is the suite of Solidity contracts powering Nouns DAO.

### nouns-sdk

The [nouns sdk](packages/nouns-sdk) exposes the Nouns contract addresses, ABIs, and instances as well as image encoding and SVG building utilities.

### nouns-subgraph

In order to make retrieving more complex data from the auction history, [nouns subgraph](packages/nouns-subgraph) contains subgraph manifests that are deployed onto [The Graph](https://thegraph.com).

### nouns-webapp

The [nouns webapp](packages/nouns-webapp) is the frontend for interacting with Noun auctions as hosted at [nouns.wtf](https://nouns.wtf).

## Quickstart

### Install dependencies

```sh
yarn
```

### Build all packages

```sh
yarn build
```

### Run Linter

```sh
yarn lint
```

### Run Prettier

```sh
yarn format
```

### Making changes/fresh deployments
Refer to respective `README` and `package.json` files for additional details.

TLDR:
- Make changes to contracts/webapp/subgraph
- Perform `yarn build` 
- Take followup step (e.g. deploy)

### Participating in governance (e.g. voting on existing proposals) via Gnosis Safe
1. Set up Gnosis safe
2. Create new transaction:
   1. "Destination" contract address should be the proxy contract address (e.g. https://rinkeby.etherscan.io/address/0x15542279208229D8958200e23eb30aF2fdB40727#code)
   2. Don't use the built-in ABI; instead, use the ABI from the logic contract (e.g. https://rinkeby.etherscan.io/address/0x939e9b344A4F26f2545D3f5a4b3eF72CB0a0af4F#code)
   3. Select a function to call, e.g. `castVote`
3. Approve transaction/reach quorum
   1. Note: make sure to do this while the vote is in session, otherwise the Gnosis UI may warn that the tx may fail
4. Execute transaction

From here, after votes have been cast, the proposal is subject to the rest of the governance process: queuing and execution.
