import React, { useContext } from "react";
import { DaoContext } from "../context/DaoContext";

export function MembersList() {
  const { memberList, shortenAddress } = useContext(DaoContext);
  
  return (
    <div>
      <h2>Member List</h2>
      <table className="card">
        <thead>
          <tr>
            <th>Address</th>
            <th>Token Amount</th>
          </tr>
        </thead>
        <tbody>
          {memberList.map((member) => {
            return (
              <tr key={member.address}>
                <td>{shortenAddress(member.address)}</td>
                <td>{member.tokenAmount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
