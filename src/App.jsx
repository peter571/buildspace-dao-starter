import { Mint } from "./components/Mint";
import { MemberPage } from "./components/MemberPage";
import { Welcome } from "./components/Welcome";
import { ChainError } from "./components/ChainError";
import { useContext } from "react";
import { DaoContext } from "./context/DaoContext";

const App = () => {
  const { address, hasClaimedNFT, network, ChainId } = useContext(DaoContext);

  if (address && network?.[0].data.chain.id !== ChainId.Rinkeby) {
    return <ChainError />;
  }

  if (!address) {
    return <Welcome />;
  }

  if (hasClaimedNFT) {
    return <MemberPage />;
  }

  return <Mint />;
};

export default App;
