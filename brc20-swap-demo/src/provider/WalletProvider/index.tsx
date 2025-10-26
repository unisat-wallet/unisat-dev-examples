"use client";
import { useNotice } from "../NoticeProvider";
import { BaseWallet } from "./wallets/BaseWallet";
import { UniSatWallet } from "./wallets/UniSatWallet";
import {
  Account,
  BtcBalance,
  ToSignInput,
  WalletEventListeners,
} from "../../types/wallet";
import {
  ErrorType,
  createAppError,
  handleUnknownError,
} from "../../utils/errorHandler";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { eventBus, EventType } from "./utils/eventBus";
import { SelectWalletModal } from "./SelectWalletModal";
import { isP2WPKH, isTapRoot } from "./utils/bitcoinUtils";

const localKey = "connected_wallet";
const supportWallet: BaseWallet[] = [new UniSatWallet()];

let canceledConnect = false;

/**
 * Wallet context interface defining all wallet operations
 */
export interface WalletContextType {
  /** Current connected account */
  account: Account | undefined;
  /** Current wallet balance */
  balance: BtcBalance | undefined;
  /** Whether wallet connection is in progress */
  isConnecting: boolean;
  /** Function to initiate wallet connection */
  connect: () => void;
  /** Sign a single PSBT */
  signPsbt: (
    psbt: string,
    opt?: { toSignInputs?: ToSignInput[] }
  ) => Promise<string>;
  /** Sign multiple PSBTs */
  signPsbts: (
    params: { psbt: string; toSignInputs?: ToSignInput[] }[]
  ) => Promise<string[]>;
  /** Sign a message */
  signMessage: (
    message: string,
    type?: "ecdsa" | "bip322-simple"
  ) => Promise<string>;
  /** Disconnect wallet */
  disconnect: () => void;
  /** Refresh wallet balance */
  refreshBalance: () => void;
  /** Current wallet instance */
  wallet: BaseWallet | undefined;
}

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

/**
 * Hook to access wallet context
 * @returns Wallet context with all wallet operations
 * @throws {Error} When used outside WalletProvider
 */
export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw Error(
      "useWallet hook can only be used by children of WalletProvider."
    );
  } else {
    return context;
  }
}

/**
 * Wallet provider component that manages wallet state and operations
 * @param children - Child components that need access to wallet context
 */
export default function WalletProvider({ children }: { children: ReactNode }) {
  const { handleError } = useNotice();

  const [wallet, setWallet] = useState<BaseWallet>();
  const [initEnd, setInitEnd] = useState(false);
  const [isShowConnectModal, setIsShowConnectModal] = useState(false);
  const [account, setAccount] = useState<Account>();
  const [connectingWallet, setConnectingWallet] = useState<BaseWallet>();

  const [balance, setBalance] = useState<BtcBalance>();

  const logout = useCallback(() => {
    setAccount(undefined);
    setWallet(undefined);
    localStorage.setItem(localKey, "");
  }, []);

  const disconnect = useCallback(() => {
    logout();
    if (wallet) wallet.disconnect();
  }, [logout, wallet]);

  useEffect(() => {
    eventBus.on(EventType.emit_disconnect_wallet, disconnect);
    return () => {
      eventBus.off(EventType.emit_disconnect_wallet, disconnect);
    };
  }, [disconnect]);

  useEffect(() => {
    eventBus.on(EventType.on_session_invalid, logout);
    return () => {
      eventBus.off(EventType.on_session_invalid, logout);
    };
  }, [logout]);

  useEffect(() => {
    async function init() {
      const connectedWallet = window.localStorage.getItem(localKey);
      // await Promise.all(
      supportWallet.map((wallet) => {
        // Initialize wallet and check if installed
        wallet.init().then(async () => {
          // If wallet was previously connected, get account info directly
          if (connectedWallet === wallet.config.type) {
            try {
              const res = await wallet.getAccount();
              if (res && isSupportAddressType(res.address)) {
                setAccount({
                  ...res,
                });
                setWallet(wallet);
              } else {
                window.localStorage.setItem(localKey, "");
              }
            } catch (e) {
              console.error(e);
              logout();
            }
          }
        });
      });
      // );
      setInitEnd(true);
    }

    init().then();
  }, [logout]);

  useEffect(() => {
    let onAccountChange: any = undefined;
    const onNetworkChange = () => {
      disconnect();
    };
    if (wallet) {
      onAccountChange = () => {
        wallet.getAccount().then(async (res) => {
          if (res && isSupportAddressType(res.address)) {
            try {
              setAccount({
                ...res,
              });
            } catch {
              disconnect();
            }
          } else {
            disconnect();
          }
        });
      };
      wallet.addListener({
        onAccountChange,
        onNetworkChange,
      });
    }
    return () => {
      if (wallet && onAccountChange) {
        wallet.removeListener({
          onAccountChange,
          onNetworkChange,
        });
      }
    };
  }, [disconnect, wallet]);

  /**
   * Get wallet balance
   */
  const getBalance = useCallback(async () => {
    if (wallet && account) {
      return wallet.getBalance();
    }
  }, [wallet, account]);

  /**
   * Refresh wallet balance and update state
   */
  const refreshBalance = useCallback(() => {
    getBalance()
      .then(setBalance)
      .catch(() => null);
  }, [getBalance]);

  const signPsbt = useCallback(
    (psbt: string, params: { toSignInputs?: ToSignInput[] } = {}) => {
      if (wallet) {
        return wallet.signPsbt(psbt, params);
      } else {
        throw new Error("Wallet is not connected");
      }
    },
    [wallet]
  );

  const signPsbts = useCallback(
    (params: { psbt: string; toSignInputs?: ToSignInput[] }[]) => {
      if (wallet) {
        return wallet.signPsbts(params);
      } else {
        throw new Error("Wallet is not connected");
      }
    },
    [wallet]
  );

  const signMessage = useCallback(
    (message: string, type = "ecdsa") => {
      if (wallet) {
        return wallet.signMessage(message, type);
      } else {
        throw new Error("Wallet is not connected");
      }
    },
    [wallet]
  );

  const onConnectClick = useCallback(
    async (wallet: BaseWallet) => {
      try {
        setConnectingWallet(wallet);
        canceledConnect = false;
        const account = await wallet.requestAccount();
        if (account && !canceledConnect) {
          if (!isSupportAddressType(account.address)) {
            return handleError(
              createAppError(ErrorType.UNSUPPORTED_ADDRESS),
              "wallet-connection"
            );
          }

          setAccount({
            ...account,
          });
          setWallet(wallet);
          window.localStorage.setItem(localKey, wallet.config.type);
          localStorage.setItem("hexa_last_connected", wallet.config.type);

          setIsShowConnectModal(false);
        }
      } catch (e) {
        handleError(e, "wallet-connection");
      } finally {
        setConnectingWallet(undefined);
      }
    },
    [handleError]
  );

  const value: WalletContextType = {
    wallet,
    account,
    isConnecting: !!connectingWallet,
    disconnect,
    signPsbt,
    signPsbts,
    signMessage,
    balance,
    refreshBalance,
    connect: () => {
      setIsShowConnectModal(true);
    },
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
      {isShowConnectModal && (
        <SelectWalletModal
          close={() => setIsShowConnectModal(false)}
          connectingWallet={connectingWallet}
          initEnd={initEnd}
          supportWallet={supportWallet}
          onConnectClick={onConnectClick}
          onCancelClick={() => {
            canceledConnect = true;
            setConnectingWallet(undefined);
          }}
        />
      )}
    </WalletContext.Provider>
  );
}

function isSupportAddressType(address: string) {
  return isP2WPKH(address) || isTapRoot(address);
}
