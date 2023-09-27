# TEALScript Project

## Documentation

For TEALScript documentation, go to https://tealscript.algo.xyz

## Usage

### Algokit

This template assumes you have a local network running on your machine. The easiet way to setup a local network is with [algokit](https://github.com/algorandfoundation/algokit-cli) if you don't have Algokit or its dependencies installed locally you can open this repository in Gitpod via https://gitpod.io/new and pasting in your repository's URL.

### Build Contract

`npm run build` will compile the contract to TEAL and generate an ABI and appspec JSON in [./contracts/artifacts](./contracts/artifacts/) and a algokit TypeScript client in [./contracts/clients](./contracts/clients/).

`npm run compile-contract` or `npm run generate-client` can be used to compile the contract or generate the contract seperately.

### Run Tests

`npm run test` will execute the tests defined in [./\_\_test\_\_](./__test__) 

### Lint

`npm run lint` will lint the contracts and tests with ESLint.
