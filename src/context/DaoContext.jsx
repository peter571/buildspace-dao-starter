import {
  useAddress,
  useMetamask,
  useEditionDrop,
  useToken,
  useVote,
  useNetwork,
} from "@thirdweb-dev/react";
import { ChainId } from "@thirdweb-dev/sdk";
import { useState, useEffect, useMemo, createContext } from "react";
import { AddressZero } from "@ethersproject/constants";

export const DaoContext = createContext({});

export const DaoProvider = ({ children }) => {

  const address = useAddress();
  const network = useNetwork();
  const connectWithMetamask = useMetamask();
  console.log("👋 Address:", address);

  // Initialize our editionDrop contract
  const editionDrop = useEditionDrop(
    "0xCE11518dcDC1ABC1127D630Cb5A327bD53D7F3cf"
  );
  // Initialize our token contract
  const token = useToken("0xFA09AfF7eA1ED44f4aa427d62d2840f3fD1f4540");

  const vote = useVote("0xF61F5c92f37712D873ADCD5b419790b5d78f5875");
  // State variable for us to know if user has our NFT.
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

  // Holds the amount of token each member has in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  // The array holding all of our members addresses.
  const [memberAddresses, setMemberAddresses] = useState([]);

  // A fancy function to shorten someones wallet address, no need to show the whole thing.
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Retrieve all our existing proposals from the contract.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }
    // A simple call to vote.getAll() to grab the proposals.
    const getAllProposals = async () => {
      try {
        const proposals = await vote.getAll();
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      } catch (error) {
        console.log("failed to get proposals", error);
      }
    };
    getAllProposals();
  }, [hasClaimedNFT, vote]);

  // We also need to check if the user already voted.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet!
    if (!proposals.length) {
      return;
    }
    const checkIfUserHasVoted = async () => {
      try {
        const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("🥵 User has already voted");
        } else {
          console.log("🙂 User has not voted yet");
        }
      } catch (error) {
        console.error("Failed to check if wallet has voted", error);
      }
    };
    checkIfUserHasVoted();
  }, [hasClaimedNFT, proposals, address, vote]);

  // This useEffect grabs all the addresses of our members holding our NFT.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    // Just like we did in the 7-airdrop-token.js file! Grab the users who hold our NFT
    // with tokenId 0.
    const getAllAddresses = async () => {
      try {
        const memberAddresses =
          await editionDrop.history.getAllClaimerAddresses(0);
        setMemberAddresses(memberAddresses);
        console.log("🚀 Members addresses", memberAddresses);
      } catch (error) {
        console.error("failed to get member list", error);
      }
    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop.history]);

  // This useEffect grabs the # of token each member holds.
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log("👜 Amounts", amounts);
      } catch (error) {
        console.error("failed to get member balances", error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token.history]);

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      // We're checking if we are finding the address in the memberTokenAmounts array.
      // If we are, we'll return the amount of token the user has.
      // Otherwise, return 0.
      const member = memberTokenAmounts?.find(
        ({ holder }) => holder === address
      );

      return {
        address,
        tokenAmount: member?.balance.displayValue || "0",
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    // If they don't have an connected wallet, exit!
    if (!address) {
      return;
    }

    const checkBalance = async () => {
      try {
        const balance = await editionDrop.balanceOf(address, 0);
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch (error) {
        setHasClaimedNFT(false);
        console.error("Failed to get balance", error);
      }
    };
    checkBalance();
  }, [address, editionDrop]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); //before we do async things, we want to disable the button to prevent double clicks

    setIsVoting(true); // lets get the votes from the form for the values

    const votes = proposals.map((proposal) => {
      const voteResult = {
        proposalId: proposal.proposalId,
        //abstain by default
        vote: 2,
      };
      proposal.votes.forEach((vote) => {
        const elem = document.getElementById(
          proposal.proposalId + "-" + vote.type
        );

        if (elem.checked) {
          voteResult.vote = vote.type;
          return;
        }
      });
      return voteResult;
    }); // first we need to make sure the user delegates their token to vote

    try {
      //we'll check if the wallet still needs to delegate their tokens before they can vote
      const delegation = await token.getDelegationOf(address); // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet

      if (delegation === AddressZero) {
        //if they haven't delegated their tokens yet, we'll have them delegate them before voting
        await token.delegateTo(address);
      } // then we need to vote on the proposals

      try {
        await Promise.all(
          votes.map(async ({ proposalId, vote: _vote }) => {
            // before voting we first need to check whether the proposal is open for voting
            // we first need to get the latest state of the proposal
            const proposal = await vote.get(proposalId); // then we check if the proposal is open for voting (state === 1 means it is open)

            if (proposal.state === 1) {
              // if it is open for voting, we'll vote on it
              return vote.vote(proposalId, _vote);
            } // if the proposal is not open for voting we just return nothing, letting us continue

            return;
          })
        );

        try {
          // if any of the propsals are ready to be executed we'll need to execute them
          // a proposal is ready to be executed if it is in state 4
          await Promise.all(
            votes.map(async ({ proposalId }) => {
              // we'll first get the latest state of the proposal again, since we may have just voted before
              const proposal = await vote.get(proposalId); //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal

              if (proposal.state === 4) {
                return vote.execute(proposalId);
              }
            })
          ); // if we get here that means we successfully voted, so let's set the "hasVoted" state to true

          setHasVoted(true); // and log out a success message

          console.log("successfully voted");
        } catch (err) {
          console.error("failed to execute votes", err);
        }
      } catch (err) {
        console.error("failed to vote", err);
      }
    } catch (err) {
      console.error("failed to delegate tokens");
    } finally {
      // in *either* case we need to set the isVoting state to false to enable the button again
      setIsVoting(false);
    }
  };

  const mintNft = async () => {
    try {
      setIsClaiming(true);
      await editionDrop.claim("0", 1);
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${editionDrop.getAddress()}/0`
      );
      setHasClaimedNFT(true);
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("Failed to mint NFT", error);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <DaoContext.Provider
      value={{
        mintNft,
        proposals,
        isVoting,
        hasVoted,
        handleSubmit,
        memberList,
        shortenAddress,
        handleSubmit,
        setHasVoted,
        memberList,
        shortenAddress,
        isClaiming,
        mintNft,
        connectWithMetamask,
        address,
        ChainId,
        network,
        hasClaimedNFT
      }}
    >
        {children}
    </DaoContext.Provider>
  );
};