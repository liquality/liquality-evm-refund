import "./style.scss";
import { useLocation } from "react-router-dom";
import { parseUrl } from "query-string";
import { chains, unitToCurrency } from "@liquality/cryptoassets";
import BrandCard from "../BrandCard";
import { getAssetFromLog, getHtlc, parseTxReceipt, refund } from "../../utils";
import { init, useConnectWallet } from "@web3-onboard/react";
import injectedModule, { ProviderLabel } from "@web3-onboard/injected-wallets";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { ChainNetworks } from "@liquality/wallet-core/dist/utils/networks";
import TxNotFound from "../NoTxFound";
import ErrorModal from "../ErrorModal";
import Button from "../Button";

const injected = injectedModule({
  filter: {
    [ProviderLabel.Liquality]: true,
    [ProviderLabel.MetaMask]: false,
  },
});

init({
  wallets: [injected],
  chains: [
    {
      id: "0x1",
      token: "ETH",
      label: "Ethereum Mainnet",
      rpcUrl: ChainNetworks.ethereum.mainnet.rpcUrl,
    },
    {
      id: "0x1E",
      token: "RBTC",
      label: "RSK Mainnet",
      rpcUrl: ChainNetworks.rsk.mainnet.rpcUrl,
    },
    {
      id: "0x38",
      token: "BNB",
      label: "Binance Smart Chain",
      rpcUrl: ChainNetworks.bsc.mainnet.rpcUrl,
    },
    {
      id: "0xA86A",
      token: "AVAX",
      label: "Avalanche",
      rpcUrl: ChainNetworks.avalanche.mainnet.rpcUrl,
    },
    {
      id: "0xA4B1",
      token: "ARBETH",
      label: "Arbitrum",
      rpcUrl: ChainNetworks.arbitrum.mainnet.rpcUrl,
    },
    {
      id: "0x89",
      token: "MATIC",
      label: "Matic",
      rpcUrl: ChainNetworks.polygon.mainnet.rpcUrl,
    },
  ],
});

export default function Refund() {
  const [loading, setLoading] = useState(true);
  const [{ wallet }, connect] = useConnectWallet();
  const [error, setError] = useState(null);
  const [log, setLog] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [htlc, setHtlc] = useState(null);
  const [expired, setExpired] = useState(false);
  const [refundAmount, setRefundAmount] = useState(null);
  const [asset, setAsset] = useState(null);
  const location = useLocation();

  const result = useMemo(() => {
    if (location.search) {
      return parseUrl(location.search);
    }
  }, [location.search]);

  const query = result?.query;

  const chain = useMemo(() => {
    if (query) {
      return chains[query.chain];
    }
  }, [query]);

  const rpcUrl = useMemo(() => {
    if (query) {
      return ChainNetworks[query.chain].mainnet.rpcUrl;
    }
  }, [query]);

  const staticJsonProvider = useMemo(() => {
    if (rpcUrl) {
      return new ethers.providers.StaticJsonRpcProvider(rpcUrl);
    }
  }, [rpcUrl]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (query.tx) {
          const txReceipt = await staticJsonProvider.getTransactionReceipt(
            query.tx
          );

          if (txReceipt) {
            const log = parseTxReceipt(txReceipt);

            if (log) {
              const htlc = await getHtlc(log.id, staticJsonProvider);
              setLog({ ...log.htlc, id: log.id });
              setHtlc({ ...htlc, id: log.id });
              console.log("LOG ", { ...log.htlc, id: log.id });

              if (log.htlc.expiration.toNumber() * 1000 <= dayjs().valueOf()) {
                setExpired(true);
              }

              const asset = getAssetFromLog(log, chain);

              if (asset && asset.code) {
                setRefundAmount(
                  unitToCurrency(asset, log.htlc.amount.toString()).toString(10)
                );
                setAsset(asset.code);
              }
            }
          }

          setReceipt(txReceipt);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchData();
    }
  }, [query, staticJsonProvider, chain]);

  async function onRefundClick() {
    if (!wallet) {
      connect();
    } else {
      try {
        if (htlc.refundAddress !== ethers.constants.AddressZero) {
          const injectedProvider = new ethers.providers.Web3Provider(
            wallet.provider,
            "any"
          );
          const signer = injectedProvider.getSigner();

          console.log("ID:", htlc.id);
          const tx = await refund(htlc.id, signer);
          console.log("TX ", tx);
        }
      } catch (err) {
        if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
          setError(
            `Transaction failed during simulation, which means it will probably fail. 
            Please check if the swap is not already refunded. 
            You can also check if it is really already expired.`
          );
        } else if (err.code === "INSUFFICIENT_FUNDS") {
          setError(`You do not have enough ${asset} to cover tx fees.`);
        } else {
          setError(err.code || err.message || err);
        }
        console.error(err);
      }
    }
  }
  console.log("QUERY ", query);

  if (!query) {
    return <BrandCard className="SwapRefund" title="RECLAIM YOUR EVM ASSETS" />;
  }

  if (loading) {
    return null;
  }

  if (!receipt) {
    return TxNotFound({ tx: query.tx, chain: query.chain });
  }

  return (
    <div>
      <BrandCard className="SwapRefund" title="RECLAIM YOUR EVM ASSETS">
        <p>{!expired && "Swap not expired yet"}</p>

        <div className="SwapRefund_confirmation">
          Refund amount:
          <p className="SwapRefund_terms">
            {refundAmount && refundAmount} {asset && asset}
          </p>
        </div>

        {htlc?.refundAddress !== ethers.constants.AddressZero ? (
          <div>
            <p>To process this refund, press the reclaim button.</p>
            <p>
              <Button onClick={() => onRefundClick()} primary wide>
                Reclaim
              </Button>
            </p>
          </div>
        ) : (
          <strong>Already Completed</strong>
        )}
      </BrandCard>
      <div className="SwapRefund_expiredFrame">
        {log && (
          <div className="SwapRefund_expiredFrame_content">
            <hr />

            <p>
              Refund Address:{" "}
              <span className="SwapRefund_expiredFrame_content_value">
                {log.refundAddress}{" "}
              </span>
            </p>

            <p>
              Expires at:{" "}
              <span className="SwapRefund_expiredFrame_content_value">
                {dayjs(log.expiration.toNumber() * 1000).format(
                  "YYYY-MM-DD HH:mm:ss"
                )}
              </span>
            </p>

            <p>
              Swap ID:{" "}
              <span className="SwapRefund_expiredFrame_content_value">
                {log.id}{" "}
              </span>
            </p>

            <hr />
          </div>
        )}

        <ErrorModal
          open={error !== null}
          error={error}
          onClose={() => setError(null)}
        />
      </div>
    </div>
  );
}
