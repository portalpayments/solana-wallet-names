import { PublicKey, type Connection } from "@solana/web3.js";
import {
  ARMANIS_WALLET,
  MIKES_WALLET,
  YCOMBINATOR_DEMO_WALLET_FOR_JARED,
} from "./constants";
import {
  twitterHandleToWalletAndProfilePicture,
  dotSolDomainToWallet,
  dotBackpackToWallet as dotBackpackToWalletAddressAndProfilePicture,
  dotGlowToWalletAndProfilePicture as dotGlowToWalletAddressAndProfilePicture,
  dotAbcDotBonkOrDotPoorToWallet,
  walletNameToAddressAndProfilePicture,
  walletToDotAbcDotBonkOrDotPoor,
  walletToDotGlowAndProfilePicture,
  walletToDotSol,
  walletToDotBackpack,
  walletToTwitterHandle,
} from ".";
import { connect } from "./connect";
import * as dotenv from "dotenv";

dotenv.config();

let rpcURL: string | null = null;
if (process.env.RPC_URL) {
  rpcURL = process.env.RPC_URL;
}

if (!rpcURL) {
  throw new Error("Please set RPC_URL in .env file");
}

let backpackJWT: string | null = null;
if (process.env.BACKPACK_JWT) {
  backpackJWT = process.env.BACKPACK_JWT;
}

const testOrSkipIfJWTNotSetup = process.env.BACKPACK_JWT ? test : test.skip;

const mikesWallet = new PublicKey(MIKES_WALLET);

describe(`names to wallet`, () => {
  let connection: Connection;
  beforeAll(async () => {
    connection = await connect(rpcURL);
  });

  describe(`dotSolDomainToWallet`, () => {
    test(`mikemaccana.sol resolves`, async () => {
      const wallet = await dotSolDomainToWallet(connection, "mikemaccana.sol");
      expect(wallet).toEqual({
        profilePicture: null,
        walletAddress: "5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM",
      });
    });

    test(`unregistered-domain-for-unit-tests.sol returns null`, async () => {
      const wallet = await dotSolDomainToWallet(
        connection,
        "unregistered-domain-for-unit-tests.sol"
      );
      expect(wallet).toEqual(null);
    });
  });

  describe(`dotBackpackToWallet`, () => {
    test(`mikemaccana.backpack resolves`, async () => {
      const wallet = await dotBackpackToWalletAddressAndProfilePicture(
        "mikemaccana.backpack"
      );
      expect(wallet).toEqual({
        profilePicture: null,
        walletAddress: MIKES_WALLET,
      });
    });

    test(`genry.backpack does not resolve`, async () => {
      const wallet = await dotBackpackToWalletAddressAndProfilePicture(
        "genry.backpack"
      );
      expect(wallet).toEqual({
        profilePicture: null,
        walletAddress: null,
      });
    });
  });

  describe(`dotGlowToWallet`, () => {
    test(`mikemaccana.glow resolves`, async () => {
      const wallet = await dotGlowToWalletAddressAndProfilePicture(
        "mikemaccana.glow"
      );
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
      const wallet = await twitterHandleToWalletAndProfilePicture(
        connection,
        "mikemaccana"
      );
      expect(wallet).toEqual({
        profilePicture:
          "https://pbs.twimg.com/profile_images/1623624287365091331/3zgMY9KG_normal.jpg",
        walletAddress: MIKES_WALLET,
      });
    });

    test(`Finds @mikemaccana's wallet (with the @ included)`, async () => {
      const wallet = await twitterHandleToWalletAndProfilePicture(
        connection,
        "@mikemaccana"
      );
      expect(wallet).toEqual({
        profilePicture:
          "https://pbs.twimg.com/profile_images/1623624287365091331/3zgMY9KG_normal.jpg",
        walletAddress: MIKES_WALLET,
      });
    });

    test(`Returns null for a bad Twitter handle`, async () => {
      const wallet = await twitterHandleToWalletAndProfilePicture(
        connection,
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
        profilePicture: null,
      });
    });

    test(`mikemaccana.sol`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "mikemaccana.sol"
      );
      expect(result).toEqual({
        walletAddress: MIKES_WALLET,
        profilePicture: null,
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
        "mikemaccana.backpack"
      );
      expect(result).toEqual({
        walletAddress: MIKES_WALLET,
        profilePicture: null,
      });
    });

    test(`@mikemaccana`, async () => {
      const result = await walletNameToAddressAndProfilePicture(
        connection,
        "@mikemaccana"
      );
      expect(result).toEqual({
        walletAddress: MIKES_WALLET,
        profilePicture:
          "https://pbs.twimg.com/profile_images/1623624287365091331/3zgMY9KG_normal.jpg",
      });
    });
  });

  // TODO: fetch creates some open handles issues here. Fix them.
  // No, sleep() won't work.
});

describe(`wallets to names`, () => {
  let connection: Connection;
  beforeAll(async () => {
    connection = await connect(rpcURL);
  });

  const WALLET_WITH_NO_NAMES = new PublicKey(YCOMBINATOR_DEMO_WALLET_FOR_JARED);

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
      const result = await walletToDotGlowAndProfilePicture(mikesWallet);
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
  });

  describe(`walletToDotBackpackDomain`, () => {
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
});
