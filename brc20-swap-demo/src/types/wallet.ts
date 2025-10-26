/**
 * Core wallet types and interfaces
 */

/**
 * Bitcoin balance information
 */
export interface BtcBalance {
  confirmed: number;
  unconfirmed: number;
  total: number;
}

/**
 * Account information from wallet
 */
export interface Account {
  address: string;
  pubKey: string;
  paymentAccount?: {
    address: string;
    pubKey: string;
  };
}

/**
 * Input to be signed in PSBT
 */
export interface ToSignInput {
  index: number;
  address: string;
  publicKey?: string;
  useTweakedSigner?: boolean;
}

/**
 * Wallet configuration
 */
export interface WalletConfig {
  name: string;
  icon: string;
  type: string;
  supportChain: string[];
  logoPadding?: number;
}

/**
 * Wallet event listeners
 */
export interface WalletEventListeners {
  onAccountChange?: () => void;
  onNetworkChange?: () => void;
}
