# @nouns/subgraph

A subgraph that indexes nouns events.

## Quickstart

```sh
yarn
```

## Nouns Subgraph

This repo contains the templates for compiling and deploying a graphql schema to thegraph.

### Authenticate

To authenticate for The Graph deployment use the `Access Token` from The Graph dashboard.
Note that this path assumes you're using the Hosted Service, not The Graph Studio.

```sh
yarn run graph auth https://api.thegraph.com/deploy/ $ACCESS_TOKEN
```

### Create subgraph.yaml from config template

```sh
# Official Subgraph
yarn prepare:[network] # Supports rinkeby and mainnet

# Fork
yarn --silent mustache config/[network]-fork.json subgraph.yaml.mustache > subgraph.yaml
```

### Generate types to use with Typescript

```sh
yarn codegen
```

### Compile and deploy to thegraph (must be authenticated)

```sh
# Official Subgraph
yarn deploy:[network] # Supports rinkeby and mainnet

Note: this step assumes you have created a Hosted Service on The Graph, associated with your organization/github account.
E.g. <github username>/<name of created subgraph on Hosted Service>
# Fork
yarn deploy [organization]/[subgraph-name]
```

### Fresh deployments
Assuming contracts have been changed and/or updated...
- `rm subgraph.yaml` (this file has to get overwritten)
- Update `rinkeby-fork.json` with block numbers from the contract creations (round down by a few just to be careful not to miss any indexing)
- `yarn --silent mustache config/rinkeby-fork.json subgraph.yaml.mustache > subgraph.yaml`
- `yarn codegen`
- `yarn deploy [organization/subgraph-name]`
If the subgraph URI has changed (access via The Graph Hosted Service dashboard), once it's deployed, be sure to update `subgraphApiUri` in `nouns-webapp/src/config.ts`

### Prod deployments
Assuming contracts have been changed and/or updated...
- `rm subgraph.yaml` (this file has to get overwritten)
- Update `mainnet.json` with block numbers from the contract creations (round down by a few just to be careful not to miss any indexing)
- `yarn --silent mustache config/mainnet.json subgraph.yaml.mustache > subgraph.yaml`
- `yarn codegen`
- `yarn deploy [organization/subgraph-name]`
If the subgraph URI has changed (access via The Graph Hosted Service dashboard), once it's deployed, be sure to update `subgraphApiUri` in `nouns-webapp/src/config.ts`

