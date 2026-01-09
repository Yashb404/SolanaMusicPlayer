import { fileURLToPath } from "url";

const DEFAULT_KEY_STORE_PATH = fileURLToPath(
  new URL("../data/keys.json", import.meta.url)
);

export const config = {
  port: parseInt(process.env.PORT || "8787", 10),

  // Local IPFS daemon API (kubo): http://127.0.0.1:5001
  // Start it with: `ipfs daemon`
  ipfsApiUrl: process.env.IPFS_API_URL || "http://127.0.0.1:5001",

  // Where we store encryption keys for MVP.
  keyStorePath: process.env.KEY_STORE_PATH || DEFAULT_KEY_STORE_PATH
};
