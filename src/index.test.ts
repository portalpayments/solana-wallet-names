import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import {
  ARMANIS_WALLET,
  KRISPYS_WALLET,
  MIKES_WALLET,
  VIDORS_WALLET,
  WALLET_WITH_NO_NAME,
} from "./constants";
import {
  twitterHandleToWallet,
  dotSolToWallet,
  dotBackpackToWallet,
  dotGlowToWallet,
  dotAbcDotBonkOrDotPoorToWallet,
  walletNameToAddressAndProfilePicture,
  walletToDotAbcDotBonkOrDotPoor,
  walletToDotGlow,
  walletToDotSol,
  walletToDotBackpack,
  walletToTwitterHandle,
  walletAddressToName,
} from ".";
import { connect } from "./connect";
import * as dotenv from "dotenv";

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
  });

  describe(`dotSolDomainToWallet`, () => {
    test(`mikemaccana.sol resolves`, async () => {
      const wallet = await dotSolToWallet(connection, "mikemaccana.sol");
      expect(wallet).toEqual({
        profilePicture: null,
        walletAddress: "5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM",
      });
    });

    test(`unregistered-domain-for-unit-tests.sol returns null`, async () => {
      const wallet = await dotSolToWallet(
        connection,
        "unregistered-domain-for-unit-tests.sol"
      );
      expect(wallet).toEqual(null);
    });
  });

  describe(`dotBackpackToWallet`, () => {
    test(`mikemaccana.backpack resolves`, async () => {
      const wallet = await dotBackpackToWallet(
        "mikemaccana.backpack",
        backpackJWT
      );
      expect(wallet).toEqual({
        profilePicture: null,
        walletAddress: MIKES_WALLET,
      });
    });

    test(`armani.backpack resolves`, async () => {
      const wallet = await dotBackpackToWallet("armani.backpack", backpackJWT);
      expect(wallet).toEqual({
        profilePicture: "https://swr.xnfts.dev/avatars/armani",
        walletAddress: ARMANIS_WALLET,
      });
    });

    test(`genry.backpack resolves`, async () => {
      const wallet = await dotBackpackToWallet("genry.backpack", backpackJWT);
      expect(wallet).toEqual({
        profilePicture: "https://swr.xnfts.dev/avatars/genryqowel",
        walletAddress: "7dQhoH4Ja26DSrzRvvsYhPLf9DsVj5jX74AZJim4WVpk",
      });
    });
  });

  describe(`dotGlowToWallet`, () => {
    test(`mikemaccana.glow resolves`, async () => {
      const wallet = await dotGlowToWallet("mikemaccana.glow");
      expect(wallet).toEqual({
        profilePicture:
          "https://cdn.glow.app/g/er/ae01b288-3bc6-4248-ac49-a6b6c6132fb6",
        walletAddress: MIKES_WALLET,
      });
    });
  });

  describe(`dotAbcDotBonkOrDotPoorDomainToWallet`, () => {
    test(`mikemaccana.abc resolves`, async () => {
      const wallet = await dotAbcDotBonkOrDotPoorToWallet(
        connection,
        "mikemaccana.abc"
      );
      expect(wallet).toEqual({
        profilePicture: null,
        walletAddress: MIKES_WALLET,
      });
    });
  });

  describe(`atTwitterToWallet`, () => {
    test(`Finds @mikemaccana's wallet`, async () => {
      const wallet = await twitterHandleToWallet(
        connection,
        twitterBearerToken,
        "mikemaccana"
      );
      expect(wallet).toEqual({
        profilePicture:
          "https://pbs.twimg.com/profile_images/1623624287365091331/3zgMY9KG_normal.jpg",
        walletAddress: MIKES_WALLET,
      });
    });

    test(`Finds @mikemaccana's wallet (with the @ included)`, async () => {
      const wallet = await twitterHandleToWallet(
        connection,
        twitterBearerToken,
        "@mikemaccana"
      );
      expect(wallet).toEqual({
        profilePicture:
          "https://pbs.twimg.com/profile_images/1623624287365091331/3zgMY9KG_normal.jpg",
        walletAddress: MIKES_WALLET,
      });
    });

    test(`Finds @mikemaccana's wallet (with the @ included) without a Twitter bearer token`, async () => {
      const wallet = await twitterHandleToWallet(
        connection,
        null,
        "@mikemaccana"
      );
      expect(wallet).toEqual({
        profilePicture: null,
        walletAddress: MIKES_WALLET,
      });
    });

    test(`Returns null for a bad Twitter handle`, async () => {
      const wallet = await twitterHandleToWallet(
        connection,
        null,
        "jdhfkljsdghghsflkghfkljgshjfgl"
      );
      expect(wallet).toEqual({ profilePicture: null, walletAddress: null });
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

    test(`mikemaccana.sol`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "mikemaccana.sol"
      );
      expect(result).toEqual({
        walletAddress: MIKES_WALLET,
        profilePicture:
          "https://solana-cdn.com/cdn-cgi/image/width=100/https://nftstorage.link/ipfs/QmPS5zYVeVe17HbxLq8k34So5uu2kPWfMKbGKEH5MzwxR5/138.png",
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

    test(`mikemaccana.backpack`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "mikemaccana.backpack",
        null,
        backpackJWT
      );
      expect(result).toEqual({
        walletAddress: MIKES_WALLET,
        profilePicture:
          "https://solana-cdn.com/cdn-cgi/image/width=100/https://nftstorage.link/ipfs/QmPS5zYVeVe17HbxLq8k34So5uu2kPWfMKbGKEH5MzwxR5/138.png",
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
        profilePicture: null,
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

  describe(`walletToDotAbcDotBonkOrDotPoor`, () => {
    test(`mike's wallet resolves to .abc domain`, async () => {
      const result = await walletToDotAbcDotBonkOrDotPoor(
        connection,
        mikesWallet
      );
      expect(result).toEqual({
        profilePicture: null,
        walletName: "mikemaccana.abc",
      });
    });

    test(`wallets with no names return null`, async () => {
      const result = await walletToDotAbcDotBonkOrDotPoor(
        connection,
        WALLET_WITH_NO_NAMES
      );
      expect(result).toEqual({
        profilePicture: null,
        walletName: null,
      });
    });
  });

  describe(`walletToDotGlow`, () => {
    test(`mike's wallet resolves to .glow domain`, async () => {
      const result = await walletToDotGlow(mikesWallet);
      expect(result).toEqual({
        profilePicture:
          "https://cdn.glow.app/g/er/ae01b288-3bc6-4248-ac49-a6b6c6132fb6",
        walletName: "mikemaccana.glow",
      });
    });
  });

  describe(`walletToDotSolDomain`, () => {
    test(`mike's wallet resolves to .sol domain`, async () => {
      const result = await walletToDotSol(connection, mikesWallet);
      expect(result).toEqual({
        profilePicture: null,
        walletName: "mikemaccana.sol",
      });
    });

    test(`vidor's wallet resolves to .sol domain`, async () => {
      const result = await walletToDotSol(connection, vidorsWallet);
      expect(result).toEqual({
        profilePicture: null,
        walletName: "vidor.sol",
      });
    });

    test(`krispy's wallet resolves to .sol domain`, async () => {
      const result = await walletToDotSol(connection, krispysWallet);
      expect(result).toEqual({
        profilePicture: null,
        // Seems to change every so often
        walletName: expect.stringContaining(".sol"),
      });
    });

    test(`wallets with no names return null`, async () => {
      const result = await walletToDotSol(connection, WALLET_WITH_NO_NAMES);
      expect(result).toEqual({
        profilePicture: null,
        walletName: null,
      });
    });
  });

  describe(`walletToDotBackpack`, () => {
    // TODO: this endpoint seems to be in beta:
    // - Reverse lookup of backpack domains does not yet seem to work
    // for wallets other than Armani's.
    // - Reverse lookup of backpack domains needs a JWT
    const armanisWallet = new PublicKey(ARMANIS_WALLET);
    testOrSkipIfJWTNotSetup(
      `armani's wallet resolves to .backpack domain`,
      async () => {
        const result = await walletToDotBackpack(armanisWallet, backpackJWT);
        expect(result).toEqual({
          profilePicture: "https://swr.xnfts.dev/avatars/armani",
          walletName: "armani.backpack",
        });
      }
    );
  });

  describe(`walletToTwitterHandle`, () => {
    test(`mike's wallet resolves to @mikemaccana`, async () => {
      const handle = await walletToTwitterHandle(connection, mikesWallet);
      expect(handle).toEqual("@mikemaccana");
    });
  });

  describe(`walletAddressToNameAndProfilePicture`, () => {
    test(`mike's wallet address returns his .abc name and his Solana PFP`, async () => {
      const nameAndProfilePicture = await walletAddressToName(
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
      const nameAndProfilePicture = await walletAddressToName(
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
      const nameAndProfilePicture = await walletAddressToName(
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
      const nameAndProfilePicture = await walletAddressToName(
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
