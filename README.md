# Solana Wallet Names

This package resolves wallet names to wallet addresses across the entire Solana ecosystem.

With a single function, **you can find the wallet address for any of the following wallet names**.

With a different function, **you can find the wallet name for any wallet address**.

Supported wallet name formats:

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

## Warning and Limits

Wallet name services are a convenient shorthand for wallet addresses. However **wallet addresses do not asset identity**. The services used in this library do not check the real-world identity of people registering wallet names.
 - Many wallet names (`barclays.sol` isn't Barclays, `cashapp.sol` isn't cashapp, `joemccann.sol` isn't the well known Solana investor).
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



## Wallet address ➡️ wallet name (and profile picture)

If you have a wallet name, like `mikemaccana.abc`, and you want to get an address and profile picture:

```typescript
const walletNameAndProfilePicture = await walletAddressToNameAndProfilePicture()
```

## Wallet name ➡️ wallet address (and profile picture)

If you have a wallet address, like `mikemaccana.abc`, and you want to get an address and profile picture:

```typescript
const walletAddress
```

## Fallback Pictures

By default these libraries return `null` for missing profile pictures, but can also make a pleasant-looking decoration with:

```
await getGradient(contact.walletAddress);
```





## Limits

- In practice, very few people with .sol domains have reverse records (address to domain) set up.

- In cases where addresses can have multiple names, only the first listed name is returned.

- Backpack's wallet to name mapping seems to be in beta. It currently doesn't return results for some wallets. This endpoint also requires a 

  

  
