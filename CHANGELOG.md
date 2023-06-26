# Changelog 

## 1.1 - 2023-06-26

- Remove preliminary Ottr support (was not stable) pending proper API access.
- Integration test updates

## 2.0 - 2023-06-07

- Significantly reduce size by using the Bonfida REST API rather than @bonfida/spl-name-service library, which was large and broke between releassed, with no changelog updates to describe what broke.
- Remove Twitter support - in practice very few people used Bonfida's Twitter naming.
- The module is now ESM only.
## 1.4 - 2023-04-27

- Add preliminary `.ottr` support (backend only)
- Externalize http client.

## 1.3 - 2023-04-24

- Use `.mjs` for ESM modules - some users were having trouble using this library in React native and this seems to be the cause.
- Change order to use ANS as a final fallback.
- Consistently use the terms **wallet names** and **wallet address** in internal functions (the term 'wallet' is way overloaded in Solana).
- Add a changelog.

## 1.2 - pre 2023-04-24

 - Original public release for Grizzlython.
