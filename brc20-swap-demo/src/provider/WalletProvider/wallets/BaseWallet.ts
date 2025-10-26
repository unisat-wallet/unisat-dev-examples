import {
  BtcBalance,
  Account,
  ToSignInput,
  WalletConfig,
  WalletEventListeners,
} from "../../../types/wallet";
import { ErrorType, createAppError } from "../../../utils/errorHandler";

export enum ChainType {
  BITCOIN_MAINNET = "BITCOIN_MAINNET",
  BITCOIN_TESTNET = "BITCOIN_TESTNET",
  FRACTAL_BITCOIN_MAINNET = "FRACTAL_BITCOIN_MAINNET",
  FRACTAL_BITCOIN_TESTNET = "FRACTAL_BITCOIN_TESTNET",
}

export const ALL_CHAIN_TYPE = [
  ChainType.BITCOIN_MAINNET,
  ChainType.BITCOIN_TESTNET,
  ChainType.FRACTAL_BITCOIN_MAINNET,
  ChainType.FRACTAL_BITCOIN_TESTNET,
];

export enum WalletType {
  UniSat = "unisat",
  Okx = "okx",
  Xverse = "xverse",
}

/**
 * Abstract base class for all wallet implementations
 */
export abstract class BaseWallet {
  install: boolean = false;
  abstract config: WalletConfig;

  /**
   * Initialize the wallet and check if it's installed
   */
  abstract init(): Promise<void>;

  /**
   * Request account connection from user
   * @returns Account information if connection successful
   * @throws {AppError} When connection fails or user rejects
   */
  abstract requestAccount(): Promise<Account | undefined>;

  /**
   * Get current connected account
   * @returns Current account information
   * @throws {AppError} When wallet not connected
   */
  abstract getAccount(): Promise<Account | undefined>;

  /**
   * Add event listeners for wallet state changes
   */
  abstract addListener(listeners: WalletEventListeners): void;

  /**
   * Remove event listeners
   */
  abstract removeListener(listeners: WalletEventListeners): void;

  /**
   * Get wallet balance
   * @returns Bitcoin balance information
   * @throws {AppError} When balance retrieval fails
   */
  abstract getBalance(): Promise<BtcBalance>;

  /**
   * Sign a PSBT (Partially Signed Bitcoin Transaction)
   * @param psbt - PSBT hex string
   * @param opt - Signing options including inputs to sign
   * @returns Signed PSBT hex string
   * @throws {AppError} When signing fails or user rejects
   */
  abstract signPsbt(
    psbt: string,
    opt?: { toSignInputs?: ToSignInput[] }
  ): Promise<string>;

  /**
   * Sign multiple PSBTs
   * @param params - Array of PSBTs with signing options
   * @returns Array of signed PSBT hex strings
   * @throws {AppError} When signing fails or user rejects
   */
  abstract signPsbts(
    params: { psbt: string; toSignInputs?: ToSignInput[] }[]
  ): Promise<string[]>;

  /**
   * Sign a message
   * @param message - Message to sign
   * @param type - Signature type (ecdsa or bip322-simple)
   * @returns Signature string
   * @throws {AppError} When signing fails or user rejects
   */
  abstract signMessage(message: string, type?: string): Promise<string>;

  /**
   * Sign multiple messages
   * @param params - Array of messages to sign
   * @returns Array of signatures
   * @throws {AppError} When signing fails or user rejects
   */
  abstract signMessages(params: any[]): Promise<string[]>;

  /**
   * Disconnect from wallet
   */
  abstract disconnect(): void;

  /**
   * Check if wallet is connected
   */
  protected async checkConnection(): Promise<void> {
    if (!this.install) {
      throw createAppError(ErrorType.WALLET_NOT_FOUND);
    }

    try {
      const account = await this.getAccount();
      if (!account) {
        throw createAppError(ErrorType.WALLET_NOT_CONNECTED);
      }
    } catch (error) {
      throw createAppError(ErrorType.WALLET_NOT_CONNECTED, error as Error);
    }
  }
}
