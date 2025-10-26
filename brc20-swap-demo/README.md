# BRC20 Swap Demo

A React-based demo application showcasing how to integrate with [InSwap](https://inswap.cc/) for BRC20 token swapping using UniSat wallet.

## Features

- 🔗 **Wallet Integration**: Connect with UniSat wallet
- 💱 **Token Swapping**: Swap BRC20 tokens through InSwap protocol
- 🔐 **Secure Transactions**: Sign PSBTs and messages with proper error handling
- 📱 **Responsive UI**: Modern interface built with Ant Design
- 🛠️ **Type Safety**: Full TypeScript support with comprehensive type definitions

## Prerequisites

- Node.js 16+
- npm or yarn
- [UniSat Wallet](https://unisat.io/download) browser extension

## Installation

1. Clone the repository:

```bash
git clone https://github.com/unisat-wallet/unisat-dev-examples.git
cd unisat-dev-examples/brc20-swap-demo
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

The demo uses environment variables for API configuration. Create a `.env.local` file in the root directory:

```env
REACT_APP_API_BASE_URL=https://api.unisat.io
REACT_APP_CHAIN_TYPE=FRACTAL_BITCOIN_TESTNET
```

## Usage

1. **Connect Wallet**: Click the connect button and approve the connection in UniSat wallet
2. **Check Balance**: View your wallet balance and available tokens
3. **Swap Tokens**: Select tokens to swap and confirm the transaction
4. **Transaction Status**: Monitor transaction progress and confirmations

## API Documentation

This demo integrates with the UniSat API for BRC20 operations. For detailed API documentation, see:

- [BRC20 Swap API](https://github.com/unisat-wallet/unisat-dev-docs/blob/master/open-api/auto-generated/docs/brc20-swap.md)

## Architecture

### Project Structure

```
src/
├── components/          # React components
│   ├── Swap.tsx        # Main swap interface
│   ├── Deposit.tsx     # Deposit functionality
│   └── ConfirmSwap.tsx # Transaction confirmation
├── provider/           # Context providers
│   ├── WalletProvider/ # Wallet state management
│   └── NoticeProvider.tsx # Notification system
├── types/              # TypeScript type definitions
│   ├── wallet.ts       # Wallet-related types
│   ├── api.ts          # API request/response types
│   └── unisat.ts       # UniSat wallet types
├── utils/              # Utility functions
│   ├── errorHandler.ts # Centralized error handling
│   ├── swapApi.ts      # API integration
│   └── httpUtils.ts    # HTTP request utilities
└── styles/             # CSS styles
```

### Key Components

- **WalletProvider**: Manages wallet connection, account state, and transaction signing
- **NoticeProvider**: Handles user notifications and error messages
- **BaseWallet**: Abstract wallet interface for extensibility
- **UniSatWallet**: UniSat wallet implementation
- **Error Handling**: Centralized error management with user-friendly messages

## Supported Wallets

Currently supports:

- ✅ UniSat Wallet

Planned support:

- 🔄 OKX Wallet
- 🔄 Xverse Wallet

## Supported Networks

- Bitcoin Mainnet
- Bitcoin Testnet
- Fractal Bitcoin Mainnet
- Fractal Bitcoin Testnet

## Development

### Code Style

This project follows these conventions:

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with React best practices
- **JSDoc**: Documentation for public APIs
- **Error Handling**: Comprehensive error boundaries and user feedback

### Adding New Wallets

To add support for a new wallet:

1. Create a new wallet class extending `BaseWallet`
2. Implement all required methods
3. Add wallet configuration
4. Update the supported wallets list

Example:

```typescript
export class NewWallet extends BaseWallet {
  config: WalletConfig = {
    name: "New Wallet",
    type: WalletType.NewWallet,
    supportChain: [ChainType.BITCOIN_MAINNET],
  };

  async init(): Promise<void> {
    // Implementation
  }

  // ... other required methods
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://github.com/unisat-wallet/unisat-dev-docs)
- 🐛 [Issue Tracker](https://github.com/unisat-wallet/unisat-dev-examples/issues)
- 💬 [Discord Community](https://discord.gg/unisat)

## Acknowledgments

- [UniSat Wallet](https://unisat.io/) for wallet integration
- [InSwap](https://inswap.cc/) for the swap protocol
- [Ant Design](https://ant.design/) for UI components
