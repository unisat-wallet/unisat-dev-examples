import { UnspentOutput } from "@unisat/wallet-sdk";
import { getAddressType } from "@unisat/wallet-sdk/lib/address";
import { NetworkType } from "@unisat/wallet-sdk/lib/network";
import { Transaction } from "@unisat/wallet-sdk/lib/transaction";
import { OpenApi } from "./open-api";
const burnBrc205Byte = async (
  userAddress: string,
  userPubkey: string,
  tickerAmount: string
) => {
  const openapi = new OpenApi({
    baseUrl: "https://open-api-fractal.unisat.io",
    apiKey: "", // Please replace with your API Key
  });

  // Only support mainnet
  const networkType = NetworkType.MAINNET;

  // Token ticker
  const brc20Ticker = "WORLD";

  const fee_rate = 10;

  const transfer_res = await openapi.getBrc20TransferInscriptions(
    userAddress,
    brc20Ticker,
    0,
    100
  );

  let assetUtxos: UnspentOutput[] = [];
  let found = false;
  for (let i = 0; i < transfer_res.detail.length; i++) {
    const brc20 = transfer_res.detail[i];
    if (brc20.data.amt === tickerAmount) {
      found = true;
      const _res = await openapi.getInscriptionInfo(brc20.inscriptionId);
      const v = _res.utxo;
      assetUtxos.push({
        txid: v.txid,
        vout: v.vout,
        satoshis: v.satoshi,
        scriptPk: v.scriptPk,
        pubkey: userPubkey,
        addressType: getAddressType(userAddress, networkType),
        inscriptions: v.inscriptions,
        atomicals: [],
        rawtx: v.rawtx, // only for p2pkh
      });
      break;
    }
  }

  const tx = new Transaction();
  tx.setNetworkType(networkType);
  tx.setFeeRate(fee_rate);
  tx.setEnableRBF(true);
  tx.setChangeAddress(userAddress);

  assetUtxos.forEach((v) => {
    tx.addInput(v);
  });

  tx.outputs.push({
    script: Buffer.from("6a", "hex"),
    value: 1,
  });

  const _res = await openapi.getAddressUtxoData(userAddress);
  const gasUtxos = _res.utxo;

  const toSignInputs = await tx.addSufficientUtxosForFee(
    gasUtxos.map((v) => ({
      txid: v.txid,
      vout: v.vout,
      satoshis: v.satoshi,
      scriptPk: v.scriptPk,
      pubkey: userPubkey,
      addressType: getAddressType(userAddress, networkType),
      inscriptions: v.inscriptions,
      atomicals: [],
      rawtx: v.rawtx, // only for p2pkh
    }))
  );

  const psbt = tx.toPsbt();

  console.log(psbt.txInputs);

  return { psbt, toSignInputs };
};

const run = async () => {
  const s = await burnBrc205Byte(
    "bc1qkrewl9zclku2qngth52eezdyrwmjpcsppdkh6w",
    "02b3e9e3140da9d4a148b1471d9b3d4b1c1ff9fb69f421e19a9443365b2a647bf2",
    "1"
  );
  console.log(s.psbt.toHex());
};

run();
