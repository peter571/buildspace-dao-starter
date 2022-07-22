import React, { useContext } from "react";
import { DaoContext } from "../context/DaoContext";

export function Mint() {
  const { isClaiming, mintNft } = useContext(DaoContext);

  return (
    <div className="mint-nft">
      <h1>Mint your free 🍪DAO Membership NFT</h1>
      <button disabled={isClaiming} onClick={mintNft}>
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
}
