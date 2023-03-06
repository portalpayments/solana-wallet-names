import type { PublicKey } from "@solana/web3.js";

// From https://docs.metaplex.com/programs/token-metadata/token-standard#the-non-fungible-standard
// Note we don't currently know which fields are required / optional
// See https://github.com/metaplex-foundation/metaplex/issues/2284
export interface NonFungibleTokenMetadataStandard {
  name: string;
  description: string;
  image: string;
  external_url: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    files: Array<{
      uri: string;
      type: string;
    }>;
  };
}

// See https://docs.solflare.com/solflare/technical/profile-picture-protocol/get-a-wallets-profile-picture
export interface ProfilePictureResponse {
  isAvailable: boolean;
  url: string;
  name: string;
  metadata: NonFungibleTokenMetadataStandard;
  tokenAccount: PublicKey;
  mintAccount: PublicKey;
}
