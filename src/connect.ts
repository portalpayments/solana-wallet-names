import { Connection } from "@solana/web3.js";

import { log } from "console";

export const connect = async (rpcURL: string): Promise<Connection> => {
  log(`⚡ Connecting to ${rpcURL}`);
  const connection = new Connection(rpcURL, {
    commitment: "finalized",
    disableRetryOnRateLimit: true,
  });
  return connection;
};
