import { getAddressType } from "@unisat/wallet-sdk/lib/address";
import { ecc } from "@unisat/wallet-sdk/lib/bitcoin-core";
import { Psbt } from "bitcoinjs-lib";

import * as bitcoin from "bitcoinjs-lib";
import { Tapleaf, Taptree } from "bitcoinjs-lib/src/types";
import dataurl from "dataurl";
import ECPairFactory, { ECPairInterface } from "ecpair";

export const RBF_SEQUENCE = 0xfffffffd;

export function decodeDataurl(dataURL: string) {
  const parsedData = dataurl.parse(dataURL);
  return {
    mimetype: parsedData.mimetype,
    charset: parsedData.charset,
    data: parsedData.data,
  };
}
export interface InscribeFile {
  dataURL: string;
  address: string;
  parent: string;
}

export interface ST_InscribeOrder {
  files: InscribeFile[];
  value: number;
  fee_rate: number;
  priv_key: string;
  parent: {
    id: string;
    value: number;
    address: string;
    scriptPk: string;
    txid: string;
    vout: number;
    pubkey: string;
    rawtx?: string; // Temporary injection
  };
}

const BITCOIN_NETWORK = "mainnet";
export const toXOnly = (pubKey: Buffer) =>
  pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);

// taproot leaf version number
const TAPLEAF_VERSION = 192;
const ECPair = ECPairFactory(ecc);
export enum AddressType {
  P2PKH,
  P2WPKH,
  P2TR,
  P2SH_P2WPKH,
  M44_P2WPKH,
  M44_P2TR,
}

export interface UTXO {
  satoshi: number;
  txid: string;
  vout: number;
  confirmed?: boolean;
  rawtx?: string;
}

export const PSBT_NETWORK =
  BITCOIN_NETWORK == "mainnet"
    ? bitcoin.networks.bitcoin
    : bitcoin.networks.testnet;

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return bitcoin.crypto.taggedHash(
    "TapTweak",
    Buffer.concat(h ? [pubKey, h] : [pubKey])
  );
}

export function tweakOrderPrivkeyWithTag(signer: ECPairInterface, tag: string) {
  let privateKey: Uint8Array | undefined = signer.privateKey!;
  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), Buffer.from(tag))
  );
  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: PSBT_NETWORK,
  });
}

export function tweakPrivkeyWithRootHash(
  signer: ECPairInterface,
  rootHash: Buffer
) {
  let privateKey: Uint8Array | undefined = signer.privateKey!;
  // console.log('internalPubkey', toXOnly(signer.publicKey).toString('hex'));
  // console.log('rootHash', rootHash.toString('hex'));
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey);
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), rootHash)
  );
  const newSigner = ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: PSBT_NETWORK,
  });
  // console.log('newsigner:', newSigner.publicKey.toString('hex'));
  return newSigner;
}

export function privateKeyFromWif(wif: string) {
  return ECPair.fromWIF(wif);
}
export function buildInscriptionPayment(
  internalPubkey: Buffer,
  leafPubkey: Buffer,
  file: InscribeFile
) {
  let yourScript = [
    toXOnly(leafPubkey),
    bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_FALSE,
    bitcoin.opcodes.OP_IF,
  ];

  if (file.dataURL) {
    yourScript.push(Buffer.from("ord"));
    // - content_type, with a tag of 1, whose value is the MIME type of the body.
    yourScript.push(1);
    yourScript.push(1);
    const filedata = decodeDataurl(file.dataURL);
    let content = filedata.data;
    let contentType = filedata.mimetype;
    if (filedata.charset) {
      contentType += `;charset=${filedata.charset}`;
    }
    const contentBuffer = Buffer.from(contentType);
    if (contentBuffer.length == 1) {
      yourScript.push(1);
      yourScript.push(contentBuffer[0]);
    } else {
      yourScript.push(contentBuffer);
    }

    // parent, with a tag of 3, see provenance.
    if (file.parent) {
      yourScript.push(1);
      yourScript.push(3);
      const [parentTxid, parentVout] = file.parent.split(":");
      const s1 = Buffer.from(parentTxid, "hex").reverse();
      const s2 = Buffer.alloc(4);
      s2.writeUInt32LE(parseInt(parentVout), 0);
      // Remove trailing 0 from s2
      const s2Str = s2.toString("hex").replace(/00+$/, "");
      const parentStr = s1.toString("hex") + s2Str;

      yourScript.push(Buffer.from(parentStr, "hex"));
    }

    yourScript.push(bitcoin.opcodes.OP_0);

    const chunkSize = 520;
    const originalBuffer = Buffer.from(content);
    const contentBuffers = [];
    for (let i = 0; i < originalBuffer.length; i += chunkSize) {
      const chunk = originalBuffer.slice(i, i + chunkSize);
      if (i + chunkSize >= originalBuffer.length && chunk.length == 1) {
        contentBuffers.push(1);
        contentBuffers.push(chunk[0]);
      } else {
        contentBuffers.push(chunk);
      }
    }

    yourScript = yourScript.concat(contentBuffers);
  }
  yourScript.push(bitcoin.opcodes.OP_ENDIF);

  const tapLeaf: Tapleaf = {
    output: bitcoin.script.compile(yourScript),
    version: TAPLEAF_VERSION,
  };

  const tapTree: Taptree = tapLeaf;

  const payment = bitcoin.payments.p2tr({
    internalPubkey, // Must be the original public key
    scriptTree: tapTree, // Branch tree
    redeem: {
      output: tapLeaf.output, // Select this leaf output as the redemption script
    },
    network: PSBT_NETWORK,
  });

  const tapLeafScript = [
    {
      leafVersion: TAPLEAF_VERSION,
      script: tapLeaf.output,
      controlBlock: payment.witness![payment.witness!.length - 1],
    },
  ];

  const tapMerkleRoot = payment.hash;
  const tapLeafHashToSign = payment.hash; // Since it is the tree root, just use the root hash. Otherwise, you need to hash tapLeaf
  const utxoScript = payment.output as Buffer;
  return {
    address: payment.address,
    utxoScript,
    tapLeafScript,
    tapLeafHashToSign,
    tapMerkleRoot,
  };
}

export function generateInscribeParentOrderTxs(params: {
  order: ST_InscribeOrder;
  utxos: UTXO[];
  estimateVirtualSizes?: number[];
}) {
  const { order, utxos, estimateVirtualSizes } = params;

  // Restore original public key
  const internalPrivkey = privateKeyFromWif(order.priv_key);
  const internalPubkey = toXOnly(internalPrivkey.publicKey);
  // Generate all leaf public keys and mint scripts for inscriptions
  const leafPrivkeys: ECPairInterface[] = [];
  const leafPubkeys: Buffer[] = [];
  const payments: {
    address: string;
    utxoScript: Buffer;
    tapLeafScript: {
      leafVersion: number;
      script: Buffer;
      controlBlock: Buffer;
    }[];
    tapLeafHashToSign: Buffer;
    tapMerkleRoot: Buffer;
  }[] = [];

  // Calculate the locking script for each inscription
  for (let i = 0; i < order.files.length; i++) {
    const leafPrivkey = tweakOrderPrivkeyWithTag(internalPrivkey, i + "");
    leafPrivkeys.push(leafPrivkey);

    const leafPubkey = leafPrivkey.publicKey;
    leafPubkeys.push(leafPubkey);

    const file = order.files[i];
    const payment = buildInscriptionPayment(internalPubkey, leafPubkey, file);
    payments.push(payment);
  }

  const psbt = new Psbt({ network: PSBT_NETWORK });

  // Set the first input
  const utxo1 = utxos[0];
  psbt.addInput({
    hash: utxo1.txid,
    index: utxo1.vout,
    witnessUtxo: {
      value: utxo1.satoshi,
      script: payments[0].utxoScript,
    },
    tapLeafScript: payments[0].tapLeafScript, // Use scriptPath to unlock, need to set tapLeafScript
  });
  psbt.setInputSequence(0, RBF_SEQUENCE);

  // Set the second input
  const parent = order.parent;
  const addressType = getAddressType(parent.address);
  if (addressType == AddressType.P2TR) {
    psbt.addInput({
      hash: parent.txid,
      index: parent.vout,
      witnessUtxo: {
        value: parent.value,
        script: Buffer.from(parent.scriptPk, "hex"),
      },
      tapInternalKey: toXOnly(Buffer.from(parent.pubkey, "hex")),
    });
  } else if (addressType == AddressType.P2WPKH) {
    psbt.addInput({
      hash: parent.txid,
      index: parent.vout,
      witnessUtxo: {
        value: parent.value,
        script: Buffer.from(parent.scriptPk, "hex"),
      },
    });
  } else if (addressType === AddressType.P2PKH) {
    psbt.addInput({
      hash: parent.txid,
      index: parent.vout,
      nonWitnessUtxo: Buffer.from(parent.rawtx, "hex"),
    });
  } else if (addressType === AddressType.P2SH_P2WPKH) {
    const redeemData = bitcoin.payments.p2wpkh({
      pubkey: Buffer.from(parent.pubkey, "hex"),
    });
    psbt.addInput({
      hash: parent.txid,
      index: parent.vout,
      nonWitnessUtxo: Buffer.from(parent.rawtx, "hex"),
      redeemScript: redeemData.output,
    });
  } else {
    throw new Error("not support");
  }
  psbt.setInputSequence(1, RBF_SEQUENCE);

  // Set the third input
  const utxo2 = utxos[1];
  psbt.addInput({
    hash: utxo2.txid,
    index: utxo2.vout,
    // sighashType: Transaction.SIGHASH_ALL, // Cannot specify this sighashType, otherwise the signature will not pass, the principle is unknown for now
    witnessUtxo: {
      value: utxo2.satoshi,
      script: payments[0].utxoScript,
    },
    tapInternalKey: internalPubkey, // Use keyPath to unlock, need to set tapInternalKey and tapMerkleRoot
    tapMerkleRoot: payments[0].tapMerkleRoot,
  });
  psbt.setInputSequence(1, RBF_SEQUENCE);

  // Set outputs: the receiving address of the first inscription
  psbt.addOutput({
    address: order.files[0].address,
    value: order.value,
  });

  // Set outputs: the second is parent
  psbt.addOutput({
    address: order.parent.address,
    value: order.parent.value,
  });

  // Sign the 0th input
  psbt.signTaprootInput(0, leafPrivkeys[0], payments[0].tapLeafHashToSign);

  // Sign the 1st input
  // Wait for user to sign

  // Sign the 2nd input
  const privKey = tweakPrivkeyWithRootHash(
    internalPrivkey,
    payments[0].tapMerkleRoot
  );
  psbt.signTaprootInput(2, privKey, undefined);

  return {
    payAddress: payments[0].address,
    psbtHex: psbt.toHex(),
  };
}
