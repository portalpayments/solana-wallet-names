import { Connection } from "@solana/web3.js";

import { log } from "console";

export const connect = (rpcURL: string): Connection => {
  const connection = new Connection(rpcURL, {
    commitment: "finalized",
    disableRetryOnRateLimit: true,
  });
  return connection;
};
