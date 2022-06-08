# @nouns/subgraph

A subgraph that indexes nouns events.

## Quickstart

```sh
yarn
```

## Nouns Subgraph

This repo contains the templates for compiling and deploying a graphql schema to thegraph.

### Authenticate

To authenticate for thegraph deployment use the `Access Token` from thegraph dashboard:

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

Note: this step assumes you have created a hosted service on The Graph, associated with your organization/github account.
# Fork
yarn deploy [organization]/[subgraph-name]
```

Once the subgraph is deployed, be sure to update `subgraphApiUri` in `nouns-webapp/src/config.ts`
