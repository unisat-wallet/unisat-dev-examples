import { AddressType, txHelpers } from "@unisat/wallet-sdk";
import { ECPair, bitcoin } from "@unisat/wallet-sdk/lib/bitcoin-core";
import { NetworkType } from "@unisat/wallet-sdk/lib/network";
import { LocalWallet } from "@unisat/wallet-sdk/lib/wallet";
import { OpenApi } from "./open-api";
import { InscribeFile, generateInscribeParentOrderTxs } from "./inscribe-utils";

const mintBrc205Byte = async () => {
  const openapi = new OpenApi({
    baseUrl: "https://open-api-fractal.unisat.io",
    apiKey: "", // Please replace with your API Key
  });

  // Only support mainnet
  const networkType = NetworkType.MAINNET;

  // Minimum amount for inscription
  const DUST = 546;

  // The size of the reveal transaction, usually does not need to be changed
  const REVEAL_TX_SIZE = 350;

  // Token ticker
  const brc20Ticker = "WORLD";

  // The amount to mint this time
  const brc20Amount = "1000";

  // The inscription ID of the token
  const parentInscriptionId =
    "245b6d52838e18317338615b82808da81fd1a0a85ec0d9988a8247517650dd0ai0";

  // The inscription private key for token issuance, needs multisig
  const parentWallet = new LocalWallet(
    "XXXXXX",
    AddressType.P2WPKH,
    networkType
  );

  // Wallet for paying transaction fees, no multisig required
  const gasWallet = new LocalWallet("XXXXXXX", AddressType.P2WPKH, networkType);

  // Private key for minting, can be any empty address, only for mint protection, can be changed at any time, no multisig required
  const inscribePrivateKey = "XXXXX";

  // Receiving address
  const mintToAddress = "XXXXX";

  // fee_rate = miner fee rate
  const fee_rate = 2;
  const parentInscription = await openapi.getInscriptionInfo(
    parentInscriptionId
  );
  const _res = await openapi.getAddressUtxoData(gasWallet.address);
  const gasUtxos = _res.utxo;

  const data = JSON.stringify({
    p: "brc-20",
    op: "mint",
    tick: brc20Ticker,
    amt: brc20Amount,
  });

  const files: InscribeFile[] = [
    {
      dataURL: `data:text/plain;charset=utf-8;base64,${Buffer.from(
        data
      ).toString("base64")}`,
      parent: parentInscriptionId,
      address: mintToAddress,
    },
  ];

  const dummyUtxos = [
    {
      txid: "0000000000000000000000000000000000000000000000000000000000000000",
      vout: 0,
      satoshi: DUST, // as dummy
    },
    {
      txid: "0000000000000000000000000000000000000000000000000000000000000000",
      vout: 1,
      satoshi: 10000000000, // 100 BTC as dummy
    },
  ];

  const { payAddress } = generateInscribeParentOrderTxs({
    order: {
      files,
      fee_rate,
      value: 546,
      priv_key: inscribePrivateKey,
      parent: {
        id: parentInscription.inscriptionId,
        value: parentInscription.utxo.satoshi,
        address: parentInscription.utxo.address,
        scriptPk: parentInscription.utxo.scriptPk,
        txid: parentInscription.utxo.txid,
        vout: parentInscription.utxo.vout,
        pubkey: parentWallet.pubkey,
      },
    },
    utxos: dummyUtxos,
  });

  const gen_res1 = await txHelpers.sendBTC({
    btcUtxos: gasUtxos.map((v) => ({
      txid: v.txid,
      vout: v.vout,
      satoshis: v.satoshi,
      scriptPk: v.scriptPk,
      pubkey: gasWallet.pubkey,
      addressType: gasWallet.addressType,
      inscriptions: v.inscriptions,
      atomicals: [],
      rawtx: v.rawtx, // only for p2pkh
    })),
    tos: [
      {
        address: payAddress,
        satoshis: DUST,
      },
      {
        address: payAddress,
        satoshis: REVEAL_TX_SIZE * fee_rate,
      },
    ],
    changeAddress: gasWallet.address,
    networkType: networkType,
    feeRate: 1,
    enableRBF: true,
  });

  const commitPsbt = gen_res1.psbt;

  await gasWallet.signPsbt(commitPsbt, {
    autoFinalized: false,
  });
  commitPsbt.finalizeAllInputs();

  const commitTx = commitPsbt.extractTransaction(true);
  const commitTxId = commitTx.getId();

  console.log("commitTxId", commitTxId);

  const gen_res2 = generateInscribeParentOrderTxs({
    order: {
      files,
      fee_rate,
      value: 546,
      priv_key: inscribePrivateKey,
      parent: {
        id: parentInscription.inscriptionId,
        value: parentInscription.utxo.satoshi,
        address: parentInscription.utxo.address,
        scriptPk: parentInscription.utxo.scriptPk,
        txid: parentInscription.utxo.txid,
        vout: parentInscription.utxo.vout,
        pubkey: parentWallet.pubkey,
      },
    },
    utxos: [
      {
        txid: commitTxId,
        vout: 0,
        satoshi: DUST,
      },
      {
        txid: commitTxId,
        vout: 1,
        satoshi: REVEAL_TX_SIZE * fee_rate,
      },
    ],
  });

  const revealPsbt = bitcoin.Psbt.fromHex(gen_res2.psbtHex);
  await parentWallet.signPsbt(revealPsbt, {
    autoFinalized: false,
    toSignInputs: [
      {
        address: parentWallet.address,
        index: 1,
      },
    ],
  });

  revealPsbt.finalizeAllInputs();

  console.log(revealPsbt.txOutputs);

  const revealTx = revealPsbt.extractTransaction(true);
  const revealTxId = revealTx.getId();
  console.log("revealTxId", revealTxId);

  await openapi.pushtx(commitTx.toHex());
  console.log("push commitTx success ");

  await openapi.pushtx(revealTx.toHex());
  console.log("push revealTx success ");
};
mintBrc205Byte();
