# brc20-5byte-mint Example

This project demonstrates how to mint BRC-20 tokens with 5-byte tickers using the UniSat Wallet SDK and OpenAPI.

## Features
- Mint BRC-20 tokens with custom tickers
- Use UniSat Wallet SDK for Bitcoin and Ordinals operations
- Example scripts for minting, burning, and utility functions

## Directory Structure
- `example/brc20-5byte-mint.ts`: Main example for minting BRC-20 tokens
- `example/burn.ts`: Example for burning tokens
- `example/inscribe-utils.ts`: Utility functions for inscription and transaction
- `example/open-api/`: OpenAPI helper classes
- `example/mempool-api/`: Mempool API helpers

## Requirements
- Node.js >= 14
- API Key for UniSat OpenAPI (see code comments)

## Install
```bash
npm install
```

## Build
```bash
npm run build
```

## Run Example
Edit `example/brc20-5byte-mint.ts` to fill in your API key and wallet information, then run:
```bash
npx ts-node example/brc20-5byte-mint.ts
```

## Dependencies
- [@unisat/wallet-sdk](https://www.npmjs.com/package/@unisat/wallet-sdk)
- axios, bignumber.js, typescript, etc. (see package.json)

## License
MIT
