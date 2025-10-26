import { BaseWallet } from "../WalletProvider/wallets/BaseWallet";
import { Button, Skeleton } from "antd";
import { useMemo, useState } from "react";
import { MyModal } from "./components/MyModal";
import { CHAIN_TYPE } from "./const";

interface SelectWalletModalProps {
  close: () => void;
  connectingWallet?: BaseWallet | undefined;
  initEnd?: boolean;
  supportWallet: BaseWallet[];
  onConnectClick: (wallet: BaseWallet) => Promise<void>;
  onCancelClick?: () => void;
}

type TabKeys = "popular" | "other";

export function SelectWalletModal({
  close,
  connectingWallet,
  initEnd,
  supportWallet,
  onConnectClick,
  onCancelClick,
}: SelectWalletModalProps) {
  const [tabIndex, setTabIndex] = useState<TabKeys>("popular");
  const [lastConnected, setLastConnected] = useState("");

  const {
    popularWallet,
    otherWallet,
  }: {
    popularWallet: BaseWallet[];
    otherWallet: BaseWallet[];
  } = useMemo(() => {
    const popularWallet: BaseWallet[] = [];
    const otherWallet: BaseWallet[] = [];

    const lastConnected = localStorage.getItem("hexa_last_connected");
    setLastConnected(lastConnected || "");

    for (let i = 0; i < supportWallet.length; i += 1) {
      const wallet = supportWallet[i];

      if (lastConnected && lastConnected === wallet.config.type) {
        popularWallet.unshift(wallet);
      } else if (wallet.install) {
        popularWallet.push(wallet);
      } else {
        otherWallet.push(wallet);
      }
    }

    if (popularWallet.length + otherWallet.length <= 3) {
      return {
        popularWallet: popularWallet.concat(otherWallet),
        otherWallet: [],
      };
    }

    return {
      popularWallet,
      otherWallet,
    };
  }, [supportWallet]);

  const walletList = useMemo(() => {
    if (tabIndex === "popular") {
      return popularWallet;
    }
    return otherWallet;
  }, [otherWallet, popularWallet, tabIndex]);

  return (
    <MyModal
      width={450}
      title={connectingWallet ? "Connecting" : "Choose Wallet"}
      close={close}
      maskClosable={!connectingWallet}
    >
      <div className={"mt-5"}></div>
      {!initEnd ? (
        <Skeleton active />
      ) : connectingWallet ? (
        <div className="connecting flex-column-center gap16">
          <div
            className={"relative flex-row-center"}
            style={{ width: 84, height: 84 }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 84,
                height: 84,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "flex-start",
                animation: "anim-rotate 1.4s linear infinite",
              }}
            >
              <LoadingSvg />
            </div>
          </div>

          <div className="font16">{connectingWallet.config.name}</div>
          <Button onClick={onCancelClick} type={"text"}>
            <div className={"text-hint weight-400"}>Cancel</div>
          </Button>
        </div>
      ) : (
        // Wallet selection
        <div className={"flex-col gap-12"}>
          {supportWallet.map((wallet, index) => {
            if (!wallet.config.supportChain.includes(CHAIN_TYPE)) {
              return null;
            }

            return (
              <div
                className={`wallet-button ${
                  wallet.config.type === lastConnected ? "last-connected" : ""
                }`}
                key={wallet.config.name}
                onClick={() => {
                  return onConnectClick(wallet);
                }}
              >
                <div className={"wallet-info"}>
                  <div className="wallet-icon">
                    {wallet.config.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="wallet-name">{wallet.config.name}</div>
                </div>
                {wallet.config.type === lastConnected && (
                  <div className={"last-connected-badge"}>Last Connected</div>
                )}
                <div className="connect-arrow">→</div>
              </div>
            );
          })}

          <div className={"notice font-12"}>
            InSwap supports{" "}
            <span className={"main-color"}>Native Segwit(P2WPKH)</span> and{" "}
            <span className={"main-color"}>Taproot(P2TR)</span> addresses.
          </div>
        </div>
      )}
    </MyModal>
  );
}

function LoadingSvg() {
  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_14307_354)">
        <mask
          id="mask0_14307_354"
          style={{ maskType: "luminance" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="42"
          height="42"
        >
          <path
            d="M40.53 41.9996C41.3419 41.9996 42.0027 41.3412 41.9743 40.5299C41.7987 35.5158 40.726 30.5695 38.8029 25.9269C36.6922 20.8312 33.5985 16.2012 29.6985 12.3011C25.7984 8.40103 21.1684 5.30734 16.0727 3.19664C11.4301 1.27361 6.48384 0.200859 1.46972 0.025297C0.658363 -0.00311167 0 0.657716 0 1.46958C0 2.28144 0.658382 2.93669 1.46967 2.96724C6.09758 3.14148 10.6617 4.13758 14.9476 5.91284C19.6866 7.87579 23.9925 10.753 27.6196 14.38C31.2467 18.0071 34.1238 22.313 36.0867 27.052C37.862 31.3379 38.8581 35.902 39.0323 40.5299C39.0629 41.3412 39.7181 41.9996 40.53 41.9996Z"
            fill="white"
          />
        </mask>
        <g mask="url(#mask0_14307_354)">
          <path
            d="M40.53 41.9996C41.3419 41.9996 42.0027 41.3412 41.9743 40.5299C41.7987 35.5158 40.726 30.5695 38.8029 25.9269C36.6922 20.8312 33.5985 16.2012 29.6985 12.3011C25.7984 8.40103 21.1684 5.30734 16.0727 3.19664C11.4301 1.27361 6.48384 0.200859 1.46972 0.025297C0.658363 -0.00311167 0 0.657716 0 1.46958C0 2.28144 0.658382 2.93669 1.46967 2.96724C6.09758 3.14148 10.6617 4.13758 14.9476 5.91284C19.6866 7.87579 23.9925 10.753 27.6196 14.38C31.2467 18.0071 34.1238 22.313 36.0867 27.052C37.862 31.3379 38.8581 35.902 39.0323 40.5299C39.0629 41.3412 39.7181 41.9996 40.53 41.9996Z"
            stroke="url(#paint0_linear_14307_354)"
            strokeWidth="4"
          />
        </g>
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_14307_354"
          x1="4.5"
          y1="1"
          x2="49.9736"
          y2="23.074"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EABB5A" stopOpacity="0" />
          <stop offset="0.809227" stopColor="#EABB5A" />
          <stop offset="1" stopColor="#E78327" />
        </linearGradient>
        <clipPath id="clip0_14307_354">
          <rect width="42" height="42" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
