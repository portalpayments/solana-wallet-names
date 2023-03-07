import { PublicKey } from "@solana/web3.js";
import type { Connection } from "@solana/web3.js";
import {
  getAllDomains,
  getTwitterRegistry,
  getHandleAndRegistryKey,
  reverseLookup,
} from "@bonfida/spl-name-service";
import { getDomainKeySync, NameRegistryState } from "@bonfida/spl-name-service";
import * as http from "./http-client";
import { TldParser } from "@onsol/tldparser";
import type { MainDomain } from "@onsol/tldparser/dist/types/state/main-domain";
import type { ProfilePictureResponse } from "./types";
import { getProfilePicture as getProfilePictureUsingSolanaPFPStandard } from "@solflare-wallet/pfp";

const log = console.log;

interface WalletNameAndProfilePicture {
  walletName: string;
  profilePicture: string;
}

interface WalletAddressAndProfilePicture {
  walletAddress: string;
  profilePicture: string;
}

const getTwitterProfilePicture = async (
  twitterBearerToken: string,
  twitterHandle: string
) => {
  const responseBody = await http.get(
    `https://api.twitter.com/2/users/by/username/${twitterHandle}?user.fields=profile_image_url`,
    { Authorization: `Bearer ${twitterBearerToken}` }
  );
  return responseBody?.data?.profile_image_url || null;
};

const removeExtension = (string: string, extension: string): string => {
  const extensionWithDot = `.${extension}`;
  if (string.endsWith(extensionWithDot)) {
    return string.split(extensionWithDot)[0];
  }
  return string;
};

// https://www.npmjs.com/package/@onsol/tldparser
export const dotAbcDotBonkOrDotPoorToWallet = async (
  connection: Connection,
  dotAbcDotBonkOrDotPoorDomain: string
): Promise<WalletAddressAndProfilePicture> => {
  const parser = new TldParser(connection);
  const ownerPublicKey = await parser.getOwnerFromDomainTld(
    dotAbcDotBonkOrDotPoorDomain
  );
  return {
    walletAddress: ownerPublicKey.toBase58(),
    profilePicture: null,
  };
};

// https://www.npmjs.com/package/@onsol/tldparser
// Docs for this suck, so check out
// https://github.com/onsol-labs/tld-parser/blob/main/tests/tld-parser.spec.ts#L97
// getMainDomain() is what we want
export const walletToDotAbcDotBonkOrDotPoor = async (
  connection: Connection,
  wallet: PublicKey
): Promise<WalletNameAndProfilePicture> => {
  const parser = new TldParser(connection);
  let mainDomain: MainDomain;
  try {
    mainDomain = await parser.getMainDomain(wallet);
  } catch (thrownObject) {
    const error = thrownObject as Error;
    if (error.message.includes("Unable to find MainDomain account")) {
      return {
        walletName: null,
        profilePicture: null,
      };
    }
  }
  if (!mainDomain?.domain) {
    return {
      walletName: null,
      profilePicture: null,
    };
  }
  // Yes the . is already included in the tld
  const domainString = `${mainDomain.domain}${mainDomain.tld}`;
  return {
    walletName: domainString,
    profilePicture: null,
  };
};

// https://docs.glow.app/reference/resolve-glow-id
// The 'API' node module has a bunch of issues running in the browser so just use http module directly
export const dotGlowToWalletAndProfilePicture = async (
  dotGlowDomain: string
): Promise<WalletAddressAndProfilePicture> => {
  const dotGlowUserName = removeExtension(dotGlowDomain, "glow");
  const responseBody = await http.get(
    `https://api.glow.app/glow-id/resolve?handle=${dotGlowUserName}`
  );
  const walletAddress = responseBody?.info?.resolved || null;
  const profilePicture = responseBody?.info?.image || null;
  return {
    walletAddress,
    profilePicture,
  };
};

export const walletToDotGlowAndProfilePicture = async (wallet: PublicKey) => {
  const walletString = wallet.toBase58();
  const responseBody = await http.get(
    `https://api.glow.app/glow-id/resolve?wallet=${walletString}`
  );
  const dotGlowUsername = responseBody?.info?.handle || null;
  const walletName = `${dotGlowUsername}.glow`;
  const profilePicture = responseBody?.info?.image || null;
  return {
    walletName,
    profilePicture,
  };
};

// See https://www.quicknode.com/guides/solana-development/accounts-and-data/how-to-query-solana-naming-service-domains-sol/#set-up-your-environment
export const dotSolDomainToWallet = async (
  connection: Connection,
  dotSolDomain: string
): Promise<WalletAddressAndProfilePicture> => {
  try {
    const { pubkey } = getDomainKeySync(dotSolDomain);
    const owner = (
      await NameRegistryState.retrieve(connection, pubkey)
    ).registry.owner.toBase58();
    //
    return {
      walletAddress: owner,
      profilePicture: null,
    };
  } catch (thrownObject) {
    const error = thrownObject as Error;
    if (error.message === "Invalid name account provided") {
      return null;
    }
    throw error;
  }
};

// See https://www.quicknode.com/guides/solana-development/accounts-and-data/how-to-query-solana-naming-service-domains-sol/#reverse-lookup-find-all-domains-owned-by-a-wallet
export const walletToDotSol = async (
  connection: Connection,
  wallet: PublicKey
): Promise<WalletNameAndProfilePicture> => {
  try {
    const ownerWallet = new PublicKey(wallet);
    const allDomainKeys = await getAllDomains(connection, ownerWallet);
    if (!allDomainKeys.length) {
      return null;
    }
    const firstDomainKey = allDomainKeys[0];
    const domainKeyName = await reverseLookup(connection, firstDomainKey);
    const domainName = `${domainKeyName}.sol`;
    return {
      walletName: domainName,
      profilePicture: null,
    };
  } catch (thrownObject) {
    const error = thrownObject as Error;
    if (error.message === "Invalid wallet account provided") {
      return null;
    }
    throw error;
  }
};

export const dotBackpackToWallet = async (
  dotBackpackDomainName: string
): Promise<WalletAddressAndProfilePicture> => {
  dotBackpackDomainName = removeExtension(dotBackpackDomainName, "backpack");
  const backpackAPIEndpoint = `https://backpack-api.xnfts.dev/users/primarySolPubkey/${dotBackpackDomainName}`;
  const responseBody = await http.get(backpackAPIEndpoint);
  const result = responseBody.publicKey || null;
  return {
    walletAddress: result,
    profilePicture: null,
  };
};

// TODO: looks like a this endpoint in't finished, it doesn't work for all backpack users
// and is hidden
export const walletToDotBackpack = async (
  wallet: PublicKey,
  jwt: string
): Promise<WalletNameAndProfilePicture> => {
  const walletString = wallet.toBase58();
  const backpackAPIEndpoint = `https://backpack-api.xnfts.dev/users?usernamePrefix=${walletString}`;
  const responseBody = await http.get(backpackAPIEndpoint, {
    cookie: `jwt=${jwt}`,
  });
  const users = responseBody?.users || null;
  if (!users?.length) {
    return {
      walletName: null,
      profilePicture: null,
    };
  }
  const firstUser = users[0];
  const username = firstUser.username;
  const profilePicture = firstUser.image || null;
  const domainName = `${username}.backpack`;
  return {
    walletName: domainName,
    profilePicture,
  };
};

export const twitterHandleToWalletAndProfilePicture = async (
  connection: Connection,
  twitterBearerToken: string | null = null,
  twitterHandle: string
): Promise<WalletAddressAndProfilePicture> => {
  // Normalise the @ symbol. We don't need it.

  if (twitterHandle.startsWith("@")) {
    twitterHandle = twitterHandle.slice(1);
  }
  try {
    const registry = await getTwitterRegistry(connection, twitterHandle);
    let profilePicture = null;

    if (twitterBearerToken) {
      if (twitterBearerToken) {
        profilePicture = await getTwitterProfilePicture(
          twitterBearerToken,
          twitterHandle
        );
      }
    }
    return {
      walletAddress: registry.owner.toBase58(),
      profilePicture,
    };
  } catch (thrownObject) {
    const error = thrownObject as Error;
    if (error.message === "Invalid name account provided") {
      return {
        walletAddress: null,
        profilePicture: null,
      };
    }
  }
};

export const walletToTwitterHandle = async (
  connection: Connection,
  wallet: PublicKey
) => {
  try {
    const [handle, _RegistryKey] = await getHandleAndRegistryKey(
      connection,
      wallet
    );

    return `@${handle}`;
  } catch (thrownObject) {
    const error = thrownObject as Error;
    // They SNS user just doesn't have a Twitter reverse mapping set up
    // This is super common
    if (error.message === "Invalid reverse Twitter account provided") {
      return null;
    }
    // An unexpected error
    throw error;
  }
};

export const walletNameToAddressAndProfilePicture = async (
  // export const walletNameToAddressAndProfilePictureAndProfilePicture = async (
  connection: Connection,
  walletName: string,
  twitterBearerToken: string | null = null
): Promise<WalletAddressAndProfilePicture> => {
  // This seems to be the nicest maintained and less land-grab naming service
  // It also has multiple TLDs
  let walletAddressAndProfilePicture: WalletAddressAndProfilePicture = {
    walletAddress: null,
    profilePicture: null,
  };
  if (
    walletName.endsWith(".abc") ||
    walletName.endsWith(".bonk") ||
    walletName.endsWith(".poor")
  ) {
    walletAddressAndProfilePicture = await dotAbcDotBonkOrDotPoorToWallet(
      connection,
      walletName
    );
  }
  // Requires people to buy a custom token
  // and is complex to set up, but was more popular
  if (walletName.endsWith(".sol")) {
    walletAddressAndProfilePicture = await dotSolDomainToWallet(
      connection,
      walletName
    );
  }
  if (walletName.endsWith(".glow")) {
    walletAddressAndProfilePicture = await dotGlowToWalletAndProfilePicture(
      walletName
    );
  }
  if (walletName.endsWith(".backpack")) {
    walletAddressAndProfilePicture = await dotBackpackToWallet(walletName);
  }
  if (walletName.startsWith("@")) {
    walletAddressAndProfilePicture =
      await twitterHandleToWalletAndProfilePicture(
        connection,
        twitterBearerToken,
        walletName
      );
  }
  return walletAddressAndProfilePicture;
};

export const walletAddressToNameAndProfilePicture = async (
  connection: Connection,
  wallet: PublicKey
): Promise<WalletNameAndProfilePicture> => {
  // Order chosen to match walletNameToAddressAndProfilePicture() above.
  const dotAbcOrBonkOrPoor = await walletToDotAbcDotBonkOrDotPoor(
    connection,
    wallet
  );
  if (dotAbcOrBonkOrPoor) {
    return dotAbcOrBonkOrPoor;
  }
  const dotSol = await walletToDotSol(connection, wallet);
  if (dotSol) {
    return dotSol;
  }
  const dotGlow = await walletToDotGlowAndProfilePicture(wallet);
  if (dotGlow) {
    return dotGlow;
  }
  return null;
};

export const getProfilePicture = async (
  connection: Connection,
  walletPubkey: PublicKey
) => {
  // https://www.npmjs.com/package/@solflare-wallet/pfp
  const response = (await getProfilePictureUsingSolanaPFPStandard(
    connection,
    walletPubkey,
    {
      fallback: false,
    }
  )) as ProfilePictureResponse;

  // This API returns the Netscape 'broken' image instead of null when 'fallback' is set to false.
  // (also if we turned 'fallback' on, fallback images are ugly gravatar style autogenerated images)
  // We don't want the ugly Netscape broken images or the ugly garavatar style images so let's return null
  if (!response.url.startsWith("http")) {
    return null;
  }
  return response.url;
};
