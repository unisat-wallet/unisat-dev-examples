/**
 * UniSat wallet specific types and interfaces
 */

import { BtcBalance } from "./wallet";

/**
 * UniSat wallet interface that extends the global window object
 */
export interface UnisatWalletInterface {
  isApp: boolean;
  isTokenPocket: boolean;
  getAccounts(): Promise<string[]>;
  requestAccounts(): Promise<string[]>;
  getNetwork(): Promise<string>;
  switchNetwork(network: string): Promise<void>;
  getChain(): Promise<{ enum: string }>;
  switchChain(chain: string): Promise<void>;
  sendBitcoin(address: string, amount: number, options?: any): Promise<string>;
  on(event: string, listener: () => void): void;
  removeListener(event: string, listener: () => void): void;
  signMessage(message: string, type?: string): Promise<string>;
  multiSignMessage: (
    params: { text: string; address?: string; type?: string }[]
  ) => Promise<string[]>;
  signPsbt(psbt: string, opt: { autoFinalized: boolean }): Promise<string>;
  signPsbts(
    psbt: string[],
    opt: { autoFinalized: boolean }[]
  ): Promise<string[]>;
  getPublicKey(): Promise<string>;
  getBalance(): Promise<BtcBalance>;
  inscribeTransfer(
    tick: string,
    amount?: number | string
  ): Promise<{
    amount: string;
    inscriptionId: string;
    inscriptionNumber: number;
    ticker: string;
  }>;
  getInscriptions(num: number): Promise<void>;
  getVersion(): Promise<string>;
  pushPsbt(psbt: string): Promise<string>;
}
