import { assets } from "@liquality/cryptoassets";
import { ethers } from "ethers";
import { LiqualityHTLC__factory } from "./chain/LiqualityHTLC__factory";

export const parseTxReceipt = (txReceipt) => {
  if (txReceipt.to === "0x133713376F69C1A67d7f3594583349DFB53d8166") {
    for (const log of txReceipt.logs) {
      const initiate = tryParseLog(log);
      if (initiate) {
        return initiate.args;
      }
    }
  }
};

export const getAssetFromLog = (log, chain) => {
  return log.htlc.tokenAddress === ethers.constants.AddressZero
    ? assets[chain.nativeAsset]
    : Object.values(assets).find(
        (a) =>
          a.contractAddress?.toLowerCase() ===
          log.htlc.tokenAddress.toLowerCase()
      );
};

export const tryParseLog = (log) => {
  const contract = LiqualityHTLC__factory.connect(
    "0x133713376f69c1a67d7f3594583349dfb53d8166"
  );

  try {
    return contract.interface.parseLog(log);
  } catch (err) {
    if (err.code === "INVALID_ARGUMENT" && err.argument === "topichash") {
      return null;
    } else {
      throw err;
    }
  }
};

export const getHtlc = async (id, provider) => {
  const contract = LiqualityHTLC__factory.connect(
    "0x133713376f69c1a67d7f3594583349dfb53d8166",
    provider
  );
  return await contract.htlcs(id);
};

export const refund = async (id, provider) => {
  const contract = LiqualityHTLC__factory.connect(
    "0x133713376f69c1a67d7f3594583349dfb53d8166",
    provider
  );

  return await contract.refund(id);
};
