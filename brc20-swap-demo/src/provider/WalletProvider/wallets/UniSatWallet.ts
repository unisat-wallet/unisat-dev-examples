import { BaseWallet, ChainType, WalletType } from "../wallets/BaseWallet";
import {
  Account,
  BtcBalance,
  ToSignInput,
  WalletConfig,
  WalletEventListeners,
} from "../../../types/wallet";
import { ErrorType, createAppError } from "../../../utils/errorHandler";
import { sleep } from "../utils/utils";
import { CHAIN_TYPE } from "../const";

/**
 * UniSat Wallet implementation
 */
export class UniSatWallet extends BaseWallet {
  config: WalletConfig = {
    name: "UniSat Wallet",
    icon: "/wallet/unisat.svg",
    type: WalletType.UniSat,
    logoPadding: 4,
    supportChain: [
      ChainType.BITCOIN_MAINNET,
      ChainType.BITCOIN_TESTNET,
      ChainType.FRACTAL_BITCOIN_MAINNET,
      ChainType.FRACTAL_BITCOIN_TESTNET,
    ],
  };

  async init(): Promise<void> {
    this.install = !!window.unisat;

    // Additional check for wallet installation
    for (let i = 0; i < 10 && !this.install; i += 1) {
      await sleep(100 + i * 100);
      this.install = !!window.unisat;
      if (this.install) {
        break;
      }
    }
  }

  async requestAccount(): Promise<Account | undefined> {
    if (!this.install) {
      throw createAppError(ErrorType.WALLET_NOT_FOUND);
    }

    try {
      await this.checkNetwork();
      const addresses = await window.unisat.requestAccounts();
      const publicKey = await window.unisat.getPublicKey();

      return {
        address: addresses[0],
        pubKey: publicKey,
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        throw createAppError(ErrorType.USER_REJECTED, error);
      }
      throw createAppError(ErrorType.WALLET_NOT_CONNECTED, error as Error);
    }
  }

  async getAccount(): Promise<Account | undefined> {
    if (!this.install) {
      throw createAppError(ErrorType.WALLET_NOT_FOUND);
    }

    try {
      const accounts = await window.unisat.getAccounts();
      if (!accounts || accounts.length === 0) {
        return undefined;
      }

      if (CHAIN_TYPE === (await window.unisat.getChain())?.enum) {
        const publicKey = await window.unisat.getPublicKey();
        return {
          address: accounts[0],
          pubKey: publicKey,
        };
      }

      return undefined;
    } catch (error) {
      throw createAppError(ErrorType.WALLET_NOT_CONNECTED, error as Error);
    }
  }

  addListener(listeners: WalletEventListeners): void {
    if (!this.install) return;

    if (listeners.onAccountChange) {
      window.unisat.on("accountsChanged", listeners.onAccountChange);
    }
    if (listeners.onNetworkChange) {
      window.unisat.on("networkChanged", listeners.onNetworkChange);
    }
  }

  removeListener(listeners: WalletEventListeners): void {
    if (!this.install) return;

    if (listeners.onAccountChange) {
      window.unisat.removeListener(
        "accountsChanged",
        listeners.onAccountChange
      );
    }
    if (listeners.onNetworkChange) {
      window.unisat.removeListener("networkChanged", listeners.onNetworkChange);
    }
  }

  async getBalance(): Promise<BtcBalance> {
    if (!this.install) {
      throw createAppError(ErrorType.WALLET_NOT_FOUND);
    }

    try {
      await this.checkNetwork();
      return window.unisat.getBalance();
    } catch (error) {
      throw createAppError(ErrorType.NETWORK_ERROR, error as Error);
    }
  }

  private async checkNetwork(): Promise<boolean> {
    try {
      if (CHAIN_TYPE !== (await window.unisat.getChain())?.enum) {
        await window.unisat.switchChain(CHAIN_TYPE);
        return false;
      }
      return true;
    } catch (error) {
      throw createAppError(ErrorType.NETWORK_ERROR, error as Error);
    }
  }

  async signPsbt(
    psbt: string,
    opt?: { toSignInputs?: ToSignInput[] }
  ): Promise<string> {
    await this.checkConnection();

    try {
      await this.checkNetwork();

      const params: any = { autoFinalized: false };
      if (opt && opt.toSignInputs) {
        params.toSignInputs = opt.toSignInputs;
      }

      return window.unisat.signPsbt(psbt, params);
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        throw createAppError(ErrorType.USER_REJECTED, error);
      }
      throw createAppError(ErrorType.TRANSACTION_FAILED, error as Error);
    }
  }

  async signPsbts(
    params: { psbt: string; toSignInputs?: ToSignInput[] }[]
  ): Promise<string[]> {
    await this.checkConnection();

    try {
      await this.checkNetwork();

      const opt: any = new Array(params.length).fill({ autoFinalized: false });
      for (let i = 0; i < params.length; i += 1) {
        if (params[i].toSignInputs) {
          opt[i] = { ...opt[i], toSignInputs: params[i].toSignInputs };
        }
      }

      return window.unisat.signPsbts(
        params.map((item) => item.psbt),
        opt
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        throw createAppError(ErrorType.USER_REJECTED, error);
      }
      throw createAppError(ErrorType.TRANSACTION_FAILED, error as Error);
    }
  }

  async signMessage(message: string, type?: string): Promise<string> {
    await this.checkConnection();

    try {
      return window.unisat.signMessage(message, type);
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        throw createAppError(ErrorType.USER_REJECTED, error);
      }
      throw createAppError(ErrorType.TRANSACTION_FAILED, error as Error);
    }
  }

  async signMessages(
    params: { text: string; address?: string; type?: string }[]
  ): Promise<string[]> {
    await this.checkConnection();

    try {
      return window.unisat.multiSignMessage(params);
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        throw createAppError(ErrorType.USER_REJECTED, error);
      }
      throw createAppError(ErrorType.TRANSACTION_FAILED, error as Error);
    }
  }

  disconnect(): void {
    // UniSat wallet doesn't require explicit disconnection
  }
}
