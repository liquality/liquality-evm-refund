import BrandCard from "../BrandCard";
export default function TxNotFound({ tx, chain }) {
  return (
    <div>
      <BrandCard className="SwapRefund" title="RECLAIM YOUR EVM ASSETS">
        <div>
          <p>
            {`Transaction `}
            <strong>{tx}</strong>
            <br />
            not found in <strong>{chain?.toUpperCase()}</strong> blockchain
          </p>
        </div>
      </BrandCard>
    </div>
  );
}
