import React, { useContext } from "react";
import { DaoContext } from "../context/DaoContext";

export function Welcome() {
  const { connectWithMetamask } = useContext(DaoContext);

  return (
    <div className="landing">
      <h1>Welcome to Chelsea DAO</h1>
      <button onClick={connectWithMetamask} className="btn-hero">
        Connect your wallet
      </button>
    </div>
  );
}
