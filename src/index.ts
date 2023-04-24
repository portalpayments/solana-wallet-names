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
import { TldParser, MainDomain as ANSMainDomain } from "@onsol/tldparser";
import type { ProfilePictureResponse } from "./types";
// Name here is way too generic. We already have our own getProfilePictureUsingSolanaPFPStandard to let's call this the 'Upstream' version
import { getProfilePicture as getProfilePictureUsingSolanaPFPStandardUpstream } from "@solflare-wallet/pfp";

// Just for debugging. Keep them around as they're useful sometimes.
const log = console.log;
const stringify = (object: unknown) => JSON.stringify(object, null, 2);

interface WalletNameAndProfilePicture {
  walletName: string | null;
  profilePicture: string | null;
}

interface WalletAddressAndProfilePicture {
  walletAddress: string | null;
  profilePicture: string | null;
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
export const dotAnythingToWalletAddress = async (
  connection: Connection,
  ansDomainName: string
): Promise<WalletAddressAndProfilePicture> => {
  const parser = new TldParser(connection);
  const ownerPublicKey = await parser.getOwnerFromDomainTld(ansDomainName);
  return {
    walletAddress: ownerPublicKey?.toBase58() || null,
    profilePicture: null,
  };
};

// https://www.npmjs.com/package/@onsol/tldparser
// Docs for this suck, so check out
// https://github.com/onsol-labs/tld-parser/blob/main/tests/tld-parser.spec.ts#L78
// getMainDomain() is what we want
export const walletAddressToDotAnything = async (
  connection: Connection,
  wallet: PublicKey
): Promise<WalletNameAndProfilePicture> => {
  const parser = new TldParser(connection);
  // Assume this is an ANS Main Domain - a main domain is the domain that a wallet address
  // with multiple names will resolve to.
  let mainDomain = {} as ANSMainDomain;
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
export const dotGlowToWalletAddress = async (
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

export const walletAddressToDotGlow = async (wallet: PublicKey) => {
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
export const dotSolToWalletAddress = async (
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
      return {
        walletAddress: null,
        profilePicture: null,
      };
    }
    throw error;
  }
};

// See https://www.quicknode.com/guides/solana-development/accounts-and-data/how-to-query-solana-naming-service-domains-sol/#reverse-lookup-find-all-domains-owned-by-a-wallet
export const walletAddressToDotSol = async (
  connection: Connection,
  wallet: PublicKey
): Promise<WalletNameAndProfilePicture> => {
  try {
    const ownerWallet = new PublicKey(wallet);

    const allDomainKeys = await getAllDomains(connection, ownerWallet);
    if (!allDomainKeys.length) {
      return {
        walletName: null,
        profilePicture: null,
      };
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
      return {
        walletName: null,
        profilePicture: null,
      };
    }
    throw error;
  }
};

export const dotBackpackToWalletAddress = async (
  dotBackpackDomainName: string,
  jwt: string | null = null
): Promise<WalletAddressAndProfilePicture> => {
  // Note backpack API responses mix snake_case and CamelCase
  const dotBackpackUserName = removeExtension(
    dotBackpackDomainName,
    "backpack"
  );

  // By default use the open public endpoint
  if (!jwt) {
    // Note xray uses a different endpoint
    // ;
    // However that endpoint does not include profile pictures, however it also does not require a JWT
    //
    // Have chased in the Backpack Discord
    const responseBody = await http.get(
      `https://backpack-api.xnfts.dev/users/${dotBackpackUserName}`
    );
    // publicKeys isn't an array of publicKeys
    // it's an array of objects with a publicKey property. Euw.
    const publicKeysDetails = responseBody?.publicKeys || null;
    const firstPublicKeyDetails = publicKeysDetails[0];
    const walletAddress = firstPublicKeyDetails.publicKey || null;
    return {
      walletAddress,
      profilePicture: null,
    };
  }

  // Use a JWT if we want profile pictures
  // Also note there is a typo '&blockchain=solanalimit=6' instead of
  // '&blockchain=solana&limit=6' but the typo version is what backpack app actually uses
  // I suspect the endpoint below API searches only *other* users, ie not the user owning the JWT
  // hence 0 results for mikemaccana
  const responseBody = await http.get(
    `https://backpack-api.xnfts.dev/users?usernamePrefix=${dotBackpackUserName}&blockchain=solanalimit=6`,
    {
      cookie: `jwt=${jwt}`,
    }
  );

  const users = responseBody?.users || null;

  if (!users) {
    return {
      walletAddress: null,
      profilePicture: null,
    };
  }

  const matchingUser = users.find(
    (user: any) => user.username === dotBackpackUserName
  );

  const profilePicture = matchingUser?.image || null;

  if (!matchingUser) {
    return {
      walletAddress: null,
      profilePicture: null,
    };
  }

  const publicKeysDetails = matchingUser.public_keys || null;

  if (!publicKeysDetails?.length) {
    return {
      walletAddress: null,
      profilePicture: null,
    };
  }

  const solanaPublicKeyDetails = publicKeysDetails.find(
    (publicKeyDetails: any) => {
      return publicKeyDetails.blockchain === "solana";
    }
  );

  if (!solanaPublicKeyDetails) {
    return {
      walletAddress: null,
      profilePicture: null,
    };
  }

  const walletAddress = solanaPublicKeyDetails.publicKey || null;

  return {
    walletAddress,
    profilePicture,
  };
};

// TODO: looks like this endpoint isn't finished, it doesn't work for all backpack users
// and is hidden
export const walletAddressToDotBackpack = async (
  wallet: PublicKey,
  jwt: string | null = null
): Promise<WalletNameAndProfilePicture> => {
  // Sadly there's no public version of this API
  // Matt from Backpack 20230414:
  // "(pubkey -> username) endpoint doesn't exist anymore on purpose for identity obfuscation reasons"
  // It's odd (since name -> pubkey effectively exposes the same info) but 🤷🏻‍♂️
  if (!jwt) {
    return {
      walletName: null,
      profilePicture: null,
    };
  }
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

export const twitterHandleToWalletAddress = async (
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
    throw error;
  }
};

export const walletAddressToTwitterHandle = async (
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
  connection: Connection,
  walletName: string,
  twitterBearerToken: string | null = null,
  jwt: string | null = null
): Promise<WalletAddressAndProfilePicture> => {
  let walletAddressAndProfilePicture: WalletAddressAndProfilePicture = {
    walletAddress: null,
    profilePicture: null,
  };

  if (walletName.startsWith("@")) {
    walletAddressAndProfilePicture = await twitterHandleToWalletAddress(
      connection,
      twitterBearerToken,
      walletName
    );
  }

  // All domain name services have at least two parts
  const parts = walletName.split(".");
  if (parts.length < 2) {
    return walletAddressAndProfilePicture;
  }

  // Requires people to buy a custom token
  // and is complex to set up, but was more popular
  if (walletName.endsWith(".sol")) {
    walletAddressAndProfilePicture = await dotSolToWalletAddress(
      connection,
      walletName
    );
  }
  if (walletName.endsWith(".glow")) {
    walletAddressAndProfilePicture = await dotGlowToWalletAddress(walletName);
  }
  if (walletName.endsWith(".backpack")) {
    walletAddressAndProfilePicture = await dotBackpackToWalletAddress(
      walletName,
      jwt
    );
  }

  // ANS seems to be the nicest maintained and less land-grab naming service
  // It also has multiple TLDs, so we will fall back to it for all other domains.
  if (!walletAddressAndProfilePicture.walletAddress) {
    walletAddressAndProfilePicture = await dotAnythingToWalletAddress(
      connection,
      walletName
    );
  }

  // Use Solana PFP if we have an address but no profile picture
  if (
    walletAddressAndProfilePicture.walletAddress &&
    !walletAddressAndProfilePicture.profilePicture
  ) {
    const solanaPFPUrl = await getProfilePictureUsingSolanaPFPStandard(
      connection,
      new PublicKey(walletAddressAndProfilePicture.walletAddress)
    );
    walletAddressAndProfilePicture.profilePicture = solanaPFPUrl || null;
  }
  return walletAddressAndProfilePicture;
};

// Try all the major name services, but don't fallback to Solana PFP
export const walletAddressToNameAndProfilePicture = async (
  connection: Connection,
  wallet: PublicKey,
  backpackJWT: string | null = null
): Promise<WalletNameAndProfilePicture> => {
  const solanaPFPStandardImageURL =
    await getProfilePictureUsingSolanaPFPStandard(connection, wallet);
  const dotAnything = await walletAddressToDotAnything(connection, wallet);
  // ANS domains don't have a profile picture, so use Solana PFP Standard
  dotAnything.profilePicture = solanaPFPStandardImageURL || null;
  if (dotAnything?.walletName && dotAnything?.profilePicture) {
    return dotAnything;
  }
  const dotSol = await walletAddressToDotSol(connection, wallet);
  // Likewise .sol doesn't have a profile picture, so use Solana PFP Standard
  dotSol.profilePicture = solanaPFPStandardImageURL || null;
  if (dotSol?.walletName && dotSol?.profilePicture) {
    return dotSol;
  }
  const dotGlow = await walletAddressToDotGlow(wallet);
  if (dotGlow?.walletName && dotGlow?.profilePicture) {
    return dotGlow;
  }
  if (backpackJWT) {
    const dotBackpack = await walletAddressToDotBackpack(wallet, backpackJWT);
    if (dotBackpack?.walletName && dotBackpack?.profilePicture) {
      return dotBackpack;
    }
  }

  return {
    walletName: null,
    profilePicture: null,
  };
};

export const getProfilePictureUsingSolanaPFPStandard = async (
  connection: Connection,
  walletPubkey: PublicKey
) => {
  // https://www.npmjs.com/package/@solflare-wallet/pfp
  const response = (await getProfilePictureUsingSolanaPFPStandardUpstream(
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
