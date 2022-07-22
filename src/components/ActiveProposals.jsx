import React, { useContext } from "react";
import { DaoContext } from "../context/DaoContext";

export function ActiveProposals() {
  const { proposals, isVoting, hasVoted, handleSubmit } =
    useContext(DaoContext);
    
  return (
    <div>
      <h2>Active Proposals</h2>
      <form onSubmit={handleSubmit}>
        {proposals.map((proposal) => (
          <div key={proposal.proposalId} className="card">
            <h5>{proposal.description}</h5>
            <div>
              {proposal.votes.map(({ type, label }) => (
                <div key={type}>
                  <input
                    type="radio"
                    id={proposal.proposalId + "-" + type}
                    name={proposal.proposalId}
                    value={type} //default the "abstain" vote to checked
                    defaultChecked={type === 2}
                  />
                  <label htmlFor={proposal.proposalId + "-" + type}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button disabled={isVoting || hasVoted} type="submit">
          {isVoting
            ? "Voting..."
            : hasVoted
            ? "You Already Voted"
            : "Submit Votes"}
        </button>
        {!hasVoted && (
          <small>
            This will trigger multiple transactions that you will need to sign.
          </small>
        )}
      </form>
    </div>
  );
}
