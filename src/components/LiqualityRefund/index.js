import SwapRefund from "../SwapRefund";

import LiqualityLogo from "../../logo-text.png";
import "./style.scss";

export default function LiqualityRefund() {
  return (
    <div className="LiqualitySwap">
      <div className="LiqualitySwap_header">
        <div className="d-flex justify-content-between">
          <a href={"test"}>
            <img
              className="LiqualitySwap_logo"
              src={LiqualityLogo}
              alt="Liquality Logo"
            />
          </a>
        </div>
      </div>
      <div className="LiqualitySwap_main">
        <div className="LiqualitySwap_wave" />
        <div className="LiqualitySwap_wrapper">
          <SwapRefund />
        </div>
      </div>
    </div>
  );
}
