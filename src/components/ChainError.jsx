import React from "react";

export function ChainError() {
  return (
    <div className="unsupported-network">
      <h2>Please connect to Rinkeby</h2>
      <p>
        This dapp only works on the Rinkeby network, please switch networks in
        your connected wallet.
      </p>
    </div>
  );
}
