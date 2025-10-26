import {
  Button,
  Card,
  InputNumber,
  Spin,
  Typography,
  Space,
  Divider,
} from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { AllAddressBalanceRes, ExactType, swapApi } from "../utils/swapApi";
import { ConfirmSwap } from "./ConfirmSwap";
import { useWallet } from "../provider/WalletProvider";
import { handleError } from "../utils/utils";
import {
  ReloadOutlined,
  SwapOutlined,
  WalletOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";

const tickIn = "sFB___000";
const tickOut = "sSATS___000";
const slippage = "0.005"; // 0.5%

const { Title, Text } = Typography;

export function Swap() {
  const { account, connect } = useWallet();
  const [swapBalanceMap, setSwapBalanceMap] = useState<AllAddressBalanceRes>(
    {}
  );

  const [amountIn, setAmountIn] = React.useState("");
  const [amountOut, setAmountOut] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const [showConfirm, setShowConfirm] = React.useState(false);

  useEffect(() => {
    if (!account) return;
    if (!amountIn) {
      setAmountOut("");
      return;
    }
    setIsLoading(true);
    // 500ms delay
    const timer = setTimeout(() => {
      // quote swap out
      swapApi
        .quoteSwap({
          address: account.address,
          tickIn,
          tickOut,
          amount: amountIn,
          exactType: ExactType.exactIn,
        })
        .then(({ expect }) => {
          setAmountOut(expect);
        })
        .catch((e) => {
          handleError(e);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 500);

    return () => clearTimeout(timer);
  }, [account, amountIn]);

  const refreshBalance = useCallback(() => {
    if (account) {
      swapApi
        .getAllBalance({ address: account.address })
        .then(setSwapBalanceMap)
        .catch(handleError);
    } else {
      setSwapBalanceMap({});
    }
  }, [account]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const formatBalance = (balance: string, precision: number = 8) => {
    return parseFloat(balance || "0").toFixed(precision);
  };

  const renderTokenCard = (
    title: string,
    amount: string,
    ticker: string,
    isInput: boolean = true,
    balance?: string,
    pendingBalance?: string
  ) => (
    <Card
      className="token-card"
      style={{
        background: isInput
          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        border: "none",
        borderRadius: "16px",
        color: "white",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px" }}>
            {isInput ? "You Pay" : "You Receive"}
          </Text>
          {balance && (
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px" }}>
              Balance: {formatBalance(balance, ticker === tickOut ? 6 : 8)}
              {pendingBalance && parseFloat(pendingBalance) > 0 && (
                <span>
                  {" "}
                  (+{formatBalance(pendingBalance, ticker === tickOut ? 6 : 8)})
                </span>
              )}
            </Text>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <InputNumber
            size="large"
            style={{
              width: "100%",
              border: "none",
              background: "rgba(255,255,255,0.1)",
              color: "white",
            }}
            placeholder="0.0"
            value={amount}
            stringMode={true}
            disabled={!isInput}
            onChange={isInput ? (e) => setAmountIn(e || "") : undefined}
            controls={false}
          />
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.2)",
            padding: "8px 16px",
            borderRadius: "8px",
            minWidth: "100px",
            textAlign: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>{ticker}</Text>
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <Title level={3} style={{ margin: 0, color: "#1f2937" }}>
          <SwapOutlined style={{ marginRight: "8px" }} />
          Token Swap
        </Title>
        <Text type="secondary">Swap BRC20 tokens instantly</Text>
      </div>

      {/* Wallet Connection */}
      {!account ? (
        <Card
          style={{
            textAlign: "center",
            marginBottom: "24px",
            borderRadius: "16px",
            border: "2px dashed #d1d5db",
          }}
        >
          <WalletOutlined
            style={{ fontSize: "48px", color: "#9ca3af", marginBottom: "16px" }}
          />
          <Title level={4} style={{ color: "#6b7280" }}>
            Connect Your Wallet
          </Title>
          <Text type="secondary">
            Please connect your UniSat wallet to start swapping
          </Text>
          <br />
          <br />
          <Button
            type="primary"
            size="large"
            onClick={connect}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "12px",
              height: "48px",
              fontSize: "16px",
            }}
          >
            <WalletOutlined /> Connect UniSat Wallet
          </Button>
        </Card>
      ) : (
        <Card
          style={{
            marginBottom: "24px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <Text type="secondary">Connected Wallet</Text>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "14px",
                  marginTop: "4px",
                }}
              >
                {`${account.address.slice(0, 8)}...${account.address.slice(
                  -8
                )}`}
              </div>
            </div>
            <Button
              icon={<ReloadOutlined />}
              shape="circle"
              onClick={refreshBalance}
              style={{ border: "none", background: "rgba(59, 130, 246, 0.1)" }}
            />
          </div>
        </Card>
      )}

      {account && (
        <>
          {/* Swap Interface */}
          <div style={{ marginBottom: "24px" }}>
            {/* Input Token */}
            {renderTokenCard(
              "You Pay",
              amountIn,
              tickIn,
              true,
              swapBalanceMap[tickIn]?.balance.swap,
              swapBalanceMap[tickIn]?.balance.pendingSwap
            )}

            {/* Swap Arrow */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                margin: "16px 0",
                position: "relative",
              }}
            >
              <div
                style={{
                  background: "white",
                  border: "4px solid #f3f4f6",
                  borderRadius: "50%",
                  padding: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                <ArrowDownOutlined
                  style={{ fontSize: "20px", color: "#6b7280" }}
                />
              </div>
            </div>

            {/* Output Token */}
            {renderTokenCard(
              "You Receive",
              amountOut,
              tickOut,
              false,
              swapBalanceMap[tickOut]?.balance.swap,
              swapBalanceMap[tickOut]?.balance.pendingSwap
            )}
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div style={{ textAlign: "center", margin: "16px 0" }}>
              <Spin size="small" />
              <Text style={{ marginLeft: "8px", color: "#6b7280" }}>
                Getting best price...
              </Text>
            </div>
          )}

          {/* Swap Button */}
          <Button
            type="primary"
            size="large"
            block
            loading={isLoading}
            disabled={!amountIn || !amountOut}
            onClick={() => {
              if (amountIn && amountOut) setShowConfirm(true);
            }}
            style={{
              height: "56px",
              borderRadius: "16px",
              fontSize: "18px",
              fontWeight: "bold",
              background:
                amountIn && amountOut
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : undefined,
              border: "none",
            }}
          >
            {!amountIn
              ? "Enter Amount"
              : !amountOut
              ? "Getting Quote..."
              : "Swap Tokens"}
          </Button>

          {/* Transaction Info */}
          {amountOut && (
            <Card
              style={{
                marginTop: "16px",
                borderRadius: "12px",
                background: "#f9fafb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                }}
              >
                <Text type="secondary">Slippage</Text>
                <Text>{(parseFloat(slippage) * 100).toFixed(1)}%</Text>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Confirm Dialog */}
      {showConfirm && (
        <ConfirmSwap
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          tickIn={tickIn}
          tickOut={tickOut}
          amountIn={amountIn}
          amountOut={amountOut}
          slippage={slippage}
          address={account ? account.address : ""}
          onSuccess={refreshBalance}
        />
      )}
    </div>
  );
}
