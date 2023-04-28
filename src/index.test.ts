import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import {
  ALEKSEIS_WALLET,
  ARMANIS_WALLET,
  FANE_ABC_PRETENDING_TO_BE_SBF,
  KRISPYS_WALLET,
  MIKES_WALLET,
  VIDORS_WALLET,
  WALLET_WITH_NO_NAME,
} from "./constants";
import {
  twitterHandleToWalletAddress,
  dotSolToWalletAddress,
  dotBackpackToWalletAddress,
  dotGlowToWalletAddress,
  dotAnythingToWalletAddress,
  walletNameToAddressAndProfilePicture,
  walletAddressToDotAnything,
  walletAddressToDotGlow,
  walletAddressToDotSol,
  walletAddressToDotBackpack,
  walletAddressToTwitterHandle,
  walletAddressToNameAndProfilePicture,
  dotOttrToWalletAddress,
} from ".";
import { connect } from "./connect";
import * as dotenv from "dotenv";

import { JSDOM } from "jsdom";

const log = console.log;

dotenv.config();

let rpcURL: string | null = null;
if (process.env.RPC_URL) {
  rpcURL = process.env.RPC_URL;
}

if (!rpcURL) {
  throw new Error("Please set RPC_URL in .env file");
}

let twitterBearerToken: string | null = null;
if (process.env.TWITTER_BEARER_TOKEN) {
  twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;
}

if (!twitterBearerToken) {
  throw new Error("Please set TWITTER_BEARER_TOKEN in .env file");
}

let backpackJWT: string | null = null;
if (process.env.BACKPACK_JWT) {
  backpackJWT = process.env.BACKPACK_JWT;
}

const testOrSkipIfJWTNotSetup = process.env.BACKPACK_JWT ? test : test.skip;

const mikesWallet = new PublicKey(MIKES_WALLET);
const krispysWallet = new PublicKey(KRISPYS_WALLET);
const vidorsWallet = new PublicKey(VIDORS_WALLET);
const armanisWallet = new PublicKey(ARMANIS_WALLET);

describe(`wallet names to addresses`, () => {
  let connection: Connection;
  beforeAll(async () => {
    connection = await connect(rpcURL);

    // Used for tests only, because node doesn't have a DOM parser built in
    // TODO: remove once Ottr makes API available
    class DOMParser {
      constructor() {
        return this;
      }
      parseFromString(string, contentType = "text/html") {
        return new JSDOM(string, { contentType }).window.document;
      }
    }

    globalThis.DOMParser = DOMParser;
  });

  describe(`dotSolDomainToWallet`, () => {
    test(`mikemaccana.sol resolves`, async () => {
      const walletAddressAndProfilePicture = await dotSolToWalletAddress(
        connection,
        "mikemaccana.sol"
      );
      expect(walletAddressAndProfilePicture).toEqual({
        profilePicture: null,
        walletAddress: "5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM",
      });
    });

    test(`unregistered-domain-for-unit-tests.sol returns null`, async () => {
      const walletAddressAndProfilePicture = await dotSolToWalletAddress(
        connection,
        "unregistered-domain-for-unit-tests.sol"
      );
      expect(walletAddressAndProfilePicture).toEqual({
        profilePicture: null,
        walletAddress: null,
      });
    });
  });

  describe(`dotOttrToWalletAddress`, () => {
    test("aleksei.ottr resolves", async () => {
      const walletAddressAndProfilePicture = await dotOttrToWalletAddress(
        "aleksei.ottr"
      );
      expect(walletAddressAndProfilePicture).toEqual({
        profilePicture:
          "https://s3.us-west-1.amazonaws.com/ottr.finance/profiles/6bb58431-fefc-45ae-8fda-16bb393cc942",
        walletAddress: ALEKSEIS_WALLET,
      });
    });
  });

  describe(`dotBackpackToWalletAddress`, () => {
    test(`armani.backpack resolves`, async () => {
      const walletAddressAndProfilePicture = await dotBackpackToWalletAddress(
        "armani.backpack",
        backpackJWT
      );
      expect(walletAddressAndProfilePicture).toEqual({
        profilePicture: "https://swr.xnfts.dev/avatars/armani",
        walletAddress: ARMANIS_WALLET,
      });
    });
  });

  describe(`dotGlowToWalletAddress`, () => {
    test(`mikemaccana.glow resolves`, async () => {
      const walletAddressAndProfilePicture = await dotGlowToWalletAddress(
        "mikemaccana.glow"
      );
      expect(walletAddressAndProfilePicture).toEqual({
        profilePicture:
          "https://cdn.glow.app/g/er/ae01b288-3bc6-4248-ac49-a6b6c6132fb6",
        walletAddress: MIKES_WALLET,
      });
    });
  });

  describe(`dotAnythingToWalletAddress`, () => {
    test(`mikemaccana.abc resolves`, async () => {
      const walletAddressAndProfilePicture = await dotAnythingToWalletAddress(
        connection,
        "mikemaccana.abc"
      );
      expect(walletAddressAndProfilePicture).toEqual({
        profilePicture: null,
        walletAddress: MIKES_WALLET,
      });
    });
  });

  describe(`twitterHandleToWalletAddress`, () => {
    test(`Finds @mikemaccana's wallet`, async () => {
      const walletAddressAndProfilePicture = await twitterHandleToWalletAddress(
        connection,
        twitterBearerToken,
        "mikemaccana"
      );
      expect(walletAddressAndProfilePicture).toEqual({
        profilePicture:
          "https://pbs.twimg.com/profile_images/1623624287365091331/3zgMY9KG_normal.jpg",
        walletAddress: MIKES_WALLET,
      });
    });

    test(`Finds @mikemaccana's wallet (with the @ included)`, async () => {
      const walletAddressAndProfilePicture = await twitterHandleToWalletAddress(
        connection,
        twitterBearerToken,
        "@mikemaccana"
      );
      expect(walletAddressAndProfilePicture).toEqual({
        profilePicture:
          "https://pbs.twimg.com/profile_images/1623624287365091331/3zgMY9KG_normal.jpg",
        walletAddress: MIKES_WALLET,
      });
    });

    test(`Finds @mikemaccana's wallet (with the @ included) without a Twitter bearer token`, async () => {
      const walletAddressAndProfilePicture = await twitterHandleToWalletAddress(
        connection,
        null,
        "@mikemaccana"
      );
      expect(walletAddressAndProfilePicture).toEqual({
        profilePicture: null,
        walletAddress: MIKES_WALLET,
      });
    });

    test(`Returns null for a bad Twitter handle`, async () => {
      const walletAddressAndProfilePicture = await twitterHandleToWalletAddress(
        connection,
        null,
        "jdhfkljsdghghsflkghfkljgshjfgl"
      );
      expect(walletAddressAndProfilePicture).toEqual({
        profilePicture: null,
        walletAddress: null,
      });
    });
  });

  describe(`walletNameToAddressAndProfilePicture`, () => {
    test(`mikemaccana.abc`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "mikemaccana.abc"
      );
      expect(result).toEqual({
        walletAddress: MIKES_WALLET,
        profilePicture:
          "https://solana-cdn.com/cdn-cgi/image/width=100/https://nftstorage.link/ipfs/QmPS5zYVeVe17HbxLq8k34So5uu2kPWfMKbGKEH5MzwxR5/138.png",
      });
    });

    test(`sbf.poor`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "sbf.poor"
      );
      expect(result).toEqual({
        walletAddress: FANE_ABC_PRETENDING_TO_BE_SBF,
        profilePicture: null,
      });
    });

    test(`vidor.sol`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "vidor.sol"
      );
      expect(result).toEqual({
        walletAddress: VIDORS_WALLET,
        profilePicture:
          "https://solana-cdn.com/cdn-cgi/image/width=100/https://arweave.net/i1I1GXelcZaEe5n0_TcVbVEEdz4mQR5lMWR2f6OplTs",
      });
    });

    test(`cryptogod69420.sol`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "cryptogod69420.sol"
      );
      expect(result).toEqual({
        walletAddress: KRISPYS_WALLET,
        profilePicture:
          "https://solana-cdn.com/cdn-cgi/image/width=100/https://arweave.net/T18Bw-hRAxRhUnNJ2Cx7bplQ1NqrfJCYrVeo7GzBtBs",
      });
    });

    test(`vlad.poor`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "vlad.poor"
      );
      expect(result).toEqual({
        walletAddress: null,
        profilePicture: null,
      });
    });

    test(`aleksei.ottr`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "aleksei.ottr"
      );
      expect(result).toEqual({
        walletAddress: ALEKSEIS_WALLET,
        profilePicture:
          "https://s3.us-west-1.amazonaws.com/ottr.finance/profiles/6bb58431-fefc-45ae-8fda-16bb393cc942",
      });
    });

    test(`mikemaccana.glow`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "mikemaccana.glow"
      );
      expect(result).toEqual({
        walletAddress: MIKES_WALLET,
        profilePicture:
          "https://cdn.glow.app/g/er/ae01b288-3bc6-4248-ac49-a6b6c6132fb6",
      });
    });

    test(`victor.glow`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "victor.glow"
      );
      expect(result).toEqual({
        walletAddress: "vicFprL4kcqWTykrdz6icjv2re4CbM5iq3aHtoJmxrh",
        profilePicture:
          "https://cdn.glow.app/g/7z/40bc4c8e-34a4-4e6c-a022-a1a240e0af41",
      });
    });

    test(`@mikemaccana`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "@mikemaccana",
        twitterBearerToken
      );
      expect(result).toEqual({
        walletAddress: MIKES_WALLET,
        profilePicture:
          "https://pbs.twimg.com/profile_images/1623624287365091331/3zgMY9KG_normal.jpg",
      });
    });

    test(`armani.backpack`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "armani.backpack",
        twitterBearerToken,
        backpackJWT
      );
      expect(result).toEqual({
        walletAddress: ARMANIS_WALLET,
        profilePicture: "https://swr.xnfts.dev/avatars/armani",
      });
    });
  });
});

describe(`wallet addresses to names`, () => {
  let connection: Connection;
  beforeAll(async () => {
    connection = await connect(rpcURL);
  });

  const WALLET_WITH_NO_NAMES = new PublicKey(WALLET_WITH_NO_NAME);

  describe(`walletAddressToDotAnything`, () => {
    test(`mike's wallet resolves to .abc domain`, async () => {
      const result = await walletAddressToDotAnything(connection, mikesWallet);
      expect(result).toEqual({
        profilePicture: null,
        walletName: "mikemaccana.abc",
      });
    });

    test(`wallets with no names return null`, async () => {
      const result = await walletAddressToDotAnything(
        connection,
        WALLET_WITH_NO_NAMES
      );
      expect(result).toEqual({
        profilePicture: null,
        walletName: null,
      });
    });
  });

  describe(`walletAddressToDotGlow`, () => {
    test(`mike's wallet resolves to .glow domain`, async () => {
      const result = await walletAddressToDotGlow(mikesWallet);
      expect(result).toEqual({
        profilePicture:
          "https://cdn.glow.app/g/er/ae01b288-3bc6-4248-ac49-a6b6c6132fb6",
        walletName: "mikemaccana.glow",
      });
    });
  });

  describe(`walletAddressToDotSolDomain`, () => {
    test(`mike's wallet resolves to .sol domain`, async () => {
      const result = await walletAddressToDotSol(connection, mikesWallet);
      expect(result).toEqual({
        profilePicture: null,
        walletName: "mikemaccana.sol",
      });
    });

    test(`vidor's wallet resolves to .sol domain`, async () => {
      const result = await walletAddressToDotSol(connection, vidorsWallet);
      expect(result).toEqual({
        profilePicture: null,
        walletName: "vidor.sol",
      });
    });

    test(`krispy's wallet resolves to .sol domain`, async () => {
      const result = await walletAddressToDotSol(connection, krispysWallet);
      expect(result).toEqual({
        profilePicture: null,
        // Seems to change every so often
        walletName: expect.stringContaining(".sol"),
      });
    });

    test(`wallets with no names return null`, async () => {
      const result = await walletAddressToDotSol(
        connection,
        WALLET_WITH_NO_NAMES
      );
      expect(result).toEqual({
        profilePicture: null,
        walletName: null,
      });
    });
  });

  describe(`walletAddressToDotBackpack`, () => {
    // TODO: this endpoint seems to be in beta:
    // - Reverse lookup of backpack domains does not yet seem to work
    // for wallets other than Armani's.
    // - Reverse lookup of backpack domains needs a JWT
    const armanisWallet = new PublicKey(ARMANIS_WALLET);
    testOrSkipIfJWTNotSetup(
      `armani's wallet resolves to .backpack domain`,
      async () => {
        const result = await walletAddressToDotBackpack(
          armanisWallet,
          backpackJWT
        );
        expect(result).toEqual({
          profilePicture: "https://swr.xnfts.dev/avatars/armani",
          walletName: "armani.backpack",
        });
      }
    );
  });

  describe(`walletAddressToTwitterHandle`, () => {
    test(`mike's wallet resolves to @mikemaccana`, async () => {
      const handle = await walletAddressToTwitterHandle(
        connection,
        mikesWallet
      );
      expect(handle).toEqual("@mikemaccana");
    });
  });

  describe(`walletAddressToNameAndProfilePicture`, () => {
    test(`solves mystery`, async () => {
      const nameAndProfilePicture = await walletAddressToNameAndProfilePicture(
        connection,
        new PublicKey("4uUwQyiXK2BN8PXSzbcvVTbPJL2jjc9NZambw6pJQErs")
      );
      expect(nameAndProfilePicture).toEqual({
        profilePicture: null,
        walletName: null,
      });
    });
    test(`mike's wallet address returns his .abc name and his Solana PFP`, async () => {
      const nameAndProfilePicture = await walletAddressToNameAndProfilePicture(
        connection,
        mikesWallet
      );
      expect(nameAndProfilePicture).toEqual({
        profilePicture:
          "https://solana-cdn.com/cdn-cgi/image/width=100/https://nftstorage.link/ipfs/QmPS5zYVeVe17HbxLq8k34So5uu2kPWfMKbGKEH5MzwxR5/138.png",
        walletName: "mikemaccana.abc",
      });
    });

    test(`vidor's wallet address returns his .sol wallet name and profile picture`, async () => {
      const nameAndProfilePicture = await walletAddressToNameAndProfilePicture(
        connection,
        vidorsWallet
      );
      expect(nameAndProfilePicture).toEqual({
        profilePicture:
          "https://solana-cdn.com/cdn-cgi/image/width=100/https://arweave.net/i1I1GXelcZaEe5n0_TcVbVEEdz4mQR5lMWR2f6OplTs",
        walletName: "vidor.sol",
      });
    });

    test(`krispy's wallet address returns his wallet name and profile picture`, async () => {
      const nameAndProfilePicture = await walletAddressToNameAndProfilePicture(
        connection,
        krispysWallet
      );
      expect(nameAndProfilePicture).toMatchObject({
        profilePicture:
          "https://solana-cdn.com/cdn-cgi/image/width=100/https://arweave.net/T18Bw-hRAxRhUnNJ2Cx7bplQ1NqrfJCYrVeo7GzBtBs",
        // TODO: this seems to change every so often. Investigate.
        walletName: expect.stringContaining("sol"),
      });
    });

    test(`armani's wallet address returns his wallet name`, async () => {
      const nameAndProfilePicture = await walletAddressToNameAndProfilePicture(
        connection,
        armanisWallet,
        backpackJWT
      );
      expect(nameAndProfilePicture).toEqual({
        profilePicture: "https://swr.xnfts.dev/avatars/armani",
        walletName: "armani.backpack",
      });
    });
  });
});
