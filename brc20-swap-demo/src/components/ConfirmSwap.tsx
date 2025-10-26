import React, { useEffect, useState } from "react";
import { Col, message, Modal, Row, Skeleton, Statistic } from "antd";
import { ArrowDownOutlined } from "@ant-design/icons";
import { ExactType, PreRes, swapApi, SwapReq } from "../utils/swapApi";
import { useWallet } from "../provider/WalletProvider";

type ConfirmSwapProps = {
  showConfirm: boolean;
  setShowConfirm: (showConfirm: boolean) => void;
  tickIn: string;
  tickOut: string;
  amountIn: string;
  amountOut: string;
  slippage: string;
  address: string;
  onSuccess?: () => void;
};

export function ConfirmSwap({
  showConfirm,
  setShowConfirm,
  tickIn,
  tickOut,
  amountIn,
  amountOut,
  slippage,
  address,
  onSuccess,
}: ConfirmSwapProps) {
  const { account, signMessage } = useWallet();
  const [swapReqParams, setSwapReqParams] = useState<SwapReq>();
  const [preSwap, setPreSwap] = useState<PreRes>();

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showConfirm) {
      const ts = Math.floor(Date.now() / 1000);
      const params: SwapReq = {
        address,
        tickIn,
        tickOut,
        amountIn,
        amountOut,
        slippage,
        exactType: ExactType.exactIn,
        ts,
        feeTick: "sFB___000",
        payType: "tick",
      };
      swapApi
        .preSwap(params)
        .then((res) => {
          setSwapReqParams(params);
          setPreSwap(res);
        })
        .catch((e) => {
          message.error((e && e.message) || e);
        });
    } else {
      setSwapReqParams(undefined);
      setPreSwap(undefined);
    }
  }, [address, amountIn, amountOut, showConfirm, slippage, tickIn, tickOut]);

  async function swap() {
    if (!preSwap || !swapReqParams) return;
    setIsLoading(true);
    try {
      const { signMsgs } = preSwap;

      //sign message
      let sigs = [];
      for (let i = 0; i < preSwap.signMsgs.length; i += 1) {
        const signMsg = preSwap.signMsgs[i];

        const sig = await signMessage(signMsg, "bip322-simple");

        sigs.push(sig);
      }

      const params = {
        ...swapReqParams,
        sigs,
        feeAmount: preSwap.feeAmount,
        feeTickPrice: preSwap.feeTickPrice,
        payType: "tick",
        rememberPayType: false,
        assetFeeTick: preSwap.assetFeeTick,
        assetFeeAmount: preSwap.assetFeeAmount,
        assetFeeTickPrice: preSwap.assetFeeTickPrice,
      };

      await swapApi.swap(params);

      message.success("Swap success");

      onSuccess && onSuccess();

      setShowConfirm(false);
    } catch (e: any) {
      message.error((e && e.message) || e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      open={showConfirm}
      width={640}
      onCancel={() => {
        setShowConfirm(false);
      }}
      onOk={swap}
      confirmLoading={isLoading}
    >
      <Row gutter={16} align={"middle"}>
        <Col span={24}>
          <Statistic title={`You Pay`} value={amountIn} suffix={tickIn} />
        </Col>
        <Col>
          <ArrowDownOutlined />
        </Col>
        <Col span={24}>
          <Statistic title="Your Receive" value={amountOut} suffix={tickOut} />
        </Col>
        <Col span={24} style={{ marginTop: 24 }} />
        {!preSwap ? (
          <Skeleton active />
        ) : (
          <>
            <Col span={10}>
              <Statistic
                title="Rollup Fee"
                value={preSwap.feeAmount}
                precision={6}
                suffix={"sats"}
              />
            </Col>
          </>
        )}
        <Col span={24} style={{ marginTop: 24 }} />
      </Row>
    </Modal>
  );
}
