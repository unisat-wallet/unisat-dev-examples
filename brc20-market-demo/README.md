# UniSat Marketplace API Demo

This project demonstrates how to interact with the UniSat BRC20 Marketplace API using a React-based frontend. You can list, unlist, and view BRC20 inscriptions, and experience the full workflow of the UniSat marketplace.

## Features

- Connect to UniSat browser extension wallet
- Set and manage your API Key
- View transferable BRC20 inscriptions
- List and unlist inscriptions on the marketplace
- Switch between networks

## Getting Started

### 1. Install dependencies

```bash
yarn
# or
npm install
```

### 2. Run the app

```bash
yarn start
# or
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Usage

- Make sure you have the [UniSat Wallet extension](https://unisat.io/) installed.
- Enter your UniSat OpenAPI Key (see [how to get an API Key](https://docs.unisat.io/dev/unisat-developer-service#getting-an-api-key)).
- Connect your wallet and follow the on-screen instructions.
- For API details, see the [UniSat Developer Documentation](https://docs.unisat.io/).

## Project Structure

- `src/components/` - UI components (API Key input, wallet connect, etc.)
- `src/page/` - Main pages (Assets, Listed)
- `src/provider/` - React context providers for state management
- `src/utils/` - API and utility functions

## Resources

- [UniSat Developer Documentation](https://docs.unisat.io/)
- [UniSat API Reference](https://open-api.unisat.io/)
- [Telegram Dev Support](https://t.me/+w3I7K-OLj4JmODM1)

## License

MIT


