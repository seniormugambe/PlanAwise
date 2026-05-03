import { Web3Provider } from "@/components/Web3Provider";
import { Web3Status, type Web3StatusProps } from "@/components/Web3Status";

const Web3StatusBoundary = (props: Web3StatusProps) => (
  <Web3Provider>
    <Web3Status {...props} />
  </Web3Provider>
);

export default Web3StatusBoundary;
