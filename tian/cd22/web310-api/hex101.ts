// deno-lint-ignore no-unused-vars
const DOC = `
# hex story

## bitcoin

- https://github.com/search?l=TypeScript&q=org%3Abitcoinjs+hex&type=Code
- @bitauth/libauth uses BigInt, WebAssembly, and es2017 features
  - https://github.com/bitauth/libauth/search?l=TypeScript&q=hex
  - https://github.com/bitauth/libauth/blob/b0ee146/src/lib/format/hex.ts#L37

## ethereum

- https://github.com/search?l=TypeScript&q=org%3Aethereum+hex&type=Code
- https://github.com/ethereum/js-ethereum-cryptography/search?q=hex
- https://github.com/search?q=org%3Aethereumjs+hex&type=code
- noble-sepc256k1
  - Switch to more secure & faster secp256k1 library, shave-off 90kb https://github.com/ethereum/js-ethereum-cryptography/issues/5
  - https://github.com/paulmillr/noble-secp256k1/search?l=TypeScript&q=hex
- https://github.com/search?l=TypeScript&q=org%3AOpenZeppelin+hex&type=Code
- https://github.com/search?l=TypeScript&p=1&q=org%3Atrufflesuite+hex&type=Code
- https://github.com/search?l=TypeScript&q=org%3ANomicFoundation+hex&type=Code
- https://github.com/distributed-ledger-technology/web3/search?q=hex

## polkadot

- https://github.com/search?l=TypeScript&q=org%3Aparitytech+hex&type=Code
- https://github.com/search?l=TypeScript&q=org%3Apolkadot-js+hex&type=Code
- from @noble/secp256k1
  - https://github.com/polkadot-js/common/blob/225c250634614e506cfd1bc8899284e6c7341862/packages/util-crypto/src/secp256k1/sign.ts#L31
- capi
  - https://deno.land/x/capi@v0.1.0-beta.17/util/hex.ts?s=encode


## cosmos/line

- https://github.com/search?l=TypeScript&q=org%3Acosmos+hex&type=code
- https://github.com/search?l=JavaScript&q=org%3Aline+hex&type=Code

## deno 

- https://medium.com/deno-the-complete-reference/deno-nuggets-encode-decode-hex-string-ca990ce60217

## google

- https://github.com/search?l=TypeScript&q=org%3Agoogleapis+hex&type=Code
- google-auth-library-nodejs
  - non-exported crypto module https://github.com/googleapis/google-auth-library-nodejs/blob/883cf2596664b7de8159fb29a8f16705218a2ad4/src/index.ts
  - fromArrayBufferToHex() https://github.com/googleapis/google-auth-library-nodejs/blob/883cf2596664b7de8159fb29a8f16705218a2ad4/src/crypto/crypto.ts#L96


## microsoft azure

- https://github.com/search?l=TypeScript&q=org%3AAzure+hex&type=Code
- https://github.com/Azure/azure-sdk-for-js/blob/c0db437d6df024d945918983e55616a21fce207f/sdk/core/core-util/src/hex.ts#L9
- https://github.com/Azure/azure-sdk-for-js/blob/8f72772736c27ae66120a71f1565b896f35bebf0/sdk/keyvault/keyvault-keys/test/public/utils/crypto.ts#L33

## facebook

- https://github.com/search?l=TypeScript&q=org%3Afacebook+hex&type=Code

## twitter

- https://github.com/search?q=org%3Atwitterdev+hex&type=code

## amazon

- https://github.com/search?l=TypeScript&q=org%3Aamzn+hex&type=Code

## Shopify

- https://github.com/search?l=TypeScript&q=org%3AShopify+hex&type=Code
- https://github.com/discord/discord-interactions-js/blob/c86bf337a0589ec5d91ea58b33e4036baf89b7d5/src/index.ts#L82

## discord

- https://github.com/search?l=TypeScript&q=org%3Adiscord+hex&type=Code

## solana

- https://github.com/search?l=TypeScript&q=org%3Asolana-labs+hex&type=Code
- https://github.com/solana-labs/solana-web3.js/search?q=hex


`;
//
// deno
// std/encoding/hex.ts
//
import {
  decode as hd,
  encode as he,
} from "https://deno.land/std@0.161.0/encoding/hex.ts";
import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts";
import chai from "https://esm.sh/chai@4.3.6";
const te = (s: string) => new TextEncoder().encode(s),
  td = (d: Uint8Array) => new TextDecoder().decode(d);

const data = "Dltdojo is awesome";
const dataBuf = new Uint8Array([
  68,
  108,
  116,
  100,
  111,
  106,
  111,
  32,
  105,
  115,
  32,
  97,
  119,
  101,
  115,
  111,
  109,
  101,
]);
const hexstrDenoStd = td(he(te(data)));
assertEquals(hexstrDenoStd, "446c74646f6a6f20697320617765736f6d65");
assertEquals(hd(te(hexstrDenoStd)), dataBuf);
assertEquals(td(hd(te(hexstrDenoStd))), data);

//
// polkadot-js/util/mod.ts
//
// https://github.com/polkadot-js/build-deno.land/search?q=stringToHex
// https://github.com/polkadot-js/build-deno.land/blob/e52d6e8c5f5dbc912034db045e8470bf25838c96/util/u8a/toHex.ts#L22
// https://github.com/polkadot-js/build-deno.land/search?q=hexToU8a
// https://github.com/polkadot-js/build-deno.land/blob/e52d6e8c5f5dbc912034db045e8470bf25838c96/util/hex/toU8a.ts#L41
//

import {
  hexToNumber,
  hexToU8a,
  numberToHex,
  stringToHex,
} from "https://deno.land/x/polkadot@0.2.13/util/mod.ts";

const hexstrPolkadotJs = stringToHex(data);
assertEquals(hexstrPolkadotJs, "0x446c74646f6a6f20697320617765736f6d65");
assertEquals(hexToU8a(hexstrPolkadotJs), dataBuf);
const hexnum = numberToHex(1000);
assertEquals(hexnum, "0x03e8");
assertEquals(hexToNumber(hexnum), 1000);

//
// polkadot capi
// https://deno.land/x/capi@v0.1.0-beta.17/util/hex.ts?s=encode
//

import {
  decode as capiHexDecode,
  encode as capiHexEncode,
} from "https://deno.land/x/capi@v0.1.0-beta.17/util/hex.ts";
chai.assert.equal(
  capiHexEncode(dataBuf),
  "446c74646f6a6f20697320617765736f6d65",
);
chai.assert.deepEqual(
  capiHexDecode("446c74646f6a6f20697320617765736f6d65"),
  dataBuf,
);

//
// ethereum web3 version
//
// https://github.com/distributed-ledger-technology/web3/search?q=stringToHex
// https://github.com/distributed-ledger-technology/web3/search?q=hexToBytes
//
// stringToHex = utf8ToHex = https://www.npmjs.com/package/utf8 (5 yrs old)
// https://github.com/distributed-ledger-technology/web3/blob/4143b4f0f6e52dc5dda9020111c9d905223b53ae/packages/web3-utils/src/utils.js#L161
//
// hexToBytes = from cryptojs
// https://github.com/distributed-ledger-technology/web3/blob/4143b4f0f6e52dc5dda9020111c9d905223b53ae/packages/web3-utils/src/utils.js#L300
import Web3 from "https://deno.land/x/web3@v0.11.1/mod.ts";
// https://www.chaijs.com/api/assert/
// import chai from "https://cdn.skypack.dev/chai@4.3.4?dts";
const hexstrEthWeb3 = Web3.utils.stringToHex(data);
chai.assert.equal(hexstrEthWeb3, "0x446c74646f6a6f20697320617765736f6d65");
chai.assert.deepEqual(
  Web3.utils.hexToBytes(hexstrEthWeb3),
  Array.from(dataBuf),
);
const hexnum3 = Web3.utils.numberToHex(1000);
chai.assert.equal(hexnum3, "0x3e8");
chai.assert.equal(Web3.utils.hexToNumber(hexnum3), 1000);

//
// bitauth versiion
//

import {
  binToHex,
  hexToBin,
} from "https://unpkg.com/@bitauth/libauth@1.19.1/build/module/index.js";

const hexstrBitauth = binToHex(dataBuf);
chai.assert.equal(hexstrBitauth, "446c74646f6a6f20697320617765736f6d65");
chai.assert.deepEqual(hexToBin(hexstrBitauth), dataBuf);
