import { Web3Provider } from "@/components/Web3Provider";
import Wallets from "./Wallets";

const WalletsRoute = () => (
  <Web3Provider>
    <Wallets />
  </Web3Provider>
);

export default WalletsRoute;
