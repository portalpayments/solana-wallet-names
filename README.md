# Solana Wallet Names

<img src="docs/logo.png" alt="A human wearing a badge that says Hello my name is Solana Wallet Names" />

This package resolves wallet names to wallet addresses across the entire Solana ecosystem, including 7 different name services and 4 different profile picture (PFP) services.

One function to **find the wallet address (and profile picture) for any wallet name**.

Another function **find the wallet name (and profile picture) for any wallet address**.

Supported **wallet names** are:

 - .abc
 - .backpack
 - .bonk
 - .glow
 - .poor
 - .sol
 - @twitter

Additionally this library supports **profile pictures** ('PFPs') from the following standards:

 - The Solana Profile Picture Standard
 - Glow
 - Backpack
 - Twitter

## Warning

Wallet names are a convenient alternative for wallet addresses. However **wallet names do not asset identity**. The services used in this library do not check the real-world identity of people registering wallet names.
 - Many wallet names that sounds like real world people and organisations are not those organisation - `barclays.sol` isn't Barclays, `cashapp.sol` isn't cashapp, `joemccann.sol` isn't the well known Solana investor. This isn't just Solana, all blockchain name services and DNS itself operate this way. Having a particular name registered simply means the holder was the first person to register that name.
 - Wallet name services that include given and family names do not check that the person has identification matching the given and family names.
 - Profile pictures used by these services do not check that the person depicted matches the owner of the wallet

Ensure your users are aware that wallet names do not assert identity:

> **Warning:** there is no guarantee that (walletName) represents a particular individual or organisation.

Use the [Solana Verification]() library to assert individual or organisation identity and/or get profile pictures that are proven match the identity of the wallet holder. 

# Setup

Add the following environment variables:

```
RPC_URL="https://some-solana-rpc-url"
TWITTER_BEARER_TOKEN="A very long Twitter API bearer token"
```

`TWITTER_BEARER_TOKEN` is optional. Not including `TWITTER_BEARER_TOKEN` will simply disable Twitter results.

## Wallet name ➡️ wallet address (and profile picture)

If you have a wallet name, like `mikemaccana.abc`, and you want to get an address and profile picture:

```typescript
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
} from "@portal-payments/solana-wallet-names";

const walletAddressAndProfilePicture = await walletNameToAddressAndProfilePicture(
  // A Solana connection
  connection,
  // One of: .abc .backpack .bonk .glow .poor .sol or @twitter
  "mikemaccana.abc"
);
```

`walletAddressAndProfilePicture` will look like:

```
{
  walletAddress: "5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM",
  profilePicture: https://some.url/filename.ext,
}
```

## Wallet address ➡️ wallet name (and profile picture)

If you have a wallet address, like `5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM`, and you want to get an address and profile picture:

```typescript
const nameAndProfilePicture = await walletAddressToNameAndProfilePicture(
  // A Solana connection
  connection,
  // A Solana wallet address
  walletAddress
);
```

`nameAndProfilePicture` will look like:

```
{
  walletName: "5FHwkrdxntdK24hgQU8qgBjn35Y1zwhz1GZwCkP2UJnM",
  profilePicture: https://,
}
```

## Fallback Pictures

By default these libraries return `null` for missing profile pictures, but can also make a pleasant-looking decoration with:

```
await getGradient(contact.walletAddress);
```

## Limits

- In practice, very few people with .sol domains have reverse records (address to domain) set up.
- Twitter to address lookup is handled through Bonfida .sol domains. Very few people with `.sol` domains have set up Twitter handle to `.sol` domain handling. If you do own a `.sol` domain it [setting up Twitter to .sol mapping](https://docs.bonfida.org/collection/solana-name-service-twitter) takes less than five minutes.
- In cases where addresses can have multiple account names, only the first or 'main' account name is returned.
- Backpack's wallet to name mapping seems to be in beta. It currently doesn't return results for some wallets. This endpoint also requires a Backpack JWT (unlike the name to wallet mappings, which are publicly available) so I susoect this service is still in beta.

  

  
