import React from "react";
import { MembersList } from "./MembersList";
import { ActiveProposals } from "./ActiveProposals";

export function MemberPage() {
  return (
    <div className="member-page">
      <h1>DAO Member Page</h1>
      <p>Congratulations on being a member</p>
      <div>
        <MembersList />
        <ActiveProposals />
      </div>
    </div>
  );
}
