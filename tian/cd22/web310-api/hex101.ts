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

const TheStr = "Dltdojo is awesome";
const TheHex = "446c74646f6a6f20697320617765736f6d65";
const TheBuf = new Uint8Array([
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
const hexstrDenoStd = td(he(te(TheStr)));
assertEquals(hexstrDenoStd, TheHex);
assertEquals(hd(te(hexstrDenoStd)), TheBuf);
assertEquals(td(hd(te(hexstrDenoStd))), TheStr);

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

const hexstrPolkadotJs = stringToHex(TheStr);
assertEquals(hexstrPolkadotJs, "0x446c74646f6a6f20697320617765736f6d65");
assertEquals(hexToU8a(hexstrPolkadotJs), TheBuf);
const hexnum = numberToHex(1000);
assertEquals(hexnum, "0x03e8");
assertEquals(hexToNumber(hexnum), 1000);


// 也可以直接匯入使用
import {hexToU8a as hexToU8aDirect} from 'https://raw.githubusercontent.com/polkadot-js/build-deno.land/e52d6e8c5f5dbc912034db045e8470bf25838c96/util/hex/toU8a.ts';
assertEquals(hexToU8aDirect(hexstrPolkadotJs), TheBuf);

//
// polkadot capi
// https://deno.land/x/capi@v0.1.0-beta.17/util/hex.ts?s=encode
//

import {
  decode as capiHexDecode,
  encode as capiHexEncode,
} from "https://deno.land/x/capi@v0.1.0-beta.17/util/hex.ts";
chai.assert.equal(
  capiHexEncode(TheBuf),
  TheHex,
);
chai.assert.deepEqual(
  capiHexDecode(TheHex),
  TheBuf,
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
const hexstrEthWeb3 = Web3.utils.stringToHex(TheStr);
chai.assert.equal(hexstrEthWeb3, "0x446c74646f6a6f20697320617765736f6d65");
chai.assert.deepEqual(
  Web3.utils.hexToBytes(hexstrEthWeb3),
  Array.from(TheBuf),
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

const hexstrBitauth = binToHex(TheBuf);
chai.assert.equal(hexstrBitauth, TheHex);
chai.assert.deepEqual(hexToBin(hexstrBitauth), TheBuf);

import {hexToBin as hexToBinDirect} from 'https://raw.githubusercontent.com/bitauth/libauth/b0ee146ce4682f73307057d8109b3c76114381c2/src/lib/format/hex.ts';
chai.assert.deepEqual(hexToBinDirect(TheHex), TheBuf);

// cosmjs
import { fromHex as fromHexCosmjs } from 'https://raw.githubusercontent.com/cosmos/cosmjs/2c3b27eeb3622a6108086267ba6faf3984251be3/packages/encoding/src/hex.ts';
chai.assert.deepEqual(fromHexCosmjs(TheHex), TheBuf);

// multiformats
import {toHex as toHexMultiformats, fromString as fromStringMultiformats} from 'https://raw.githubusercontent.com/multiformats/js-multiformats/af663e114e44da1554bd13e5f3fb8d428fe79035/src/bytes.js';
chai.assert.equal(toHexMultiformats(fromStringMultiformats(TheStr)), TheHex);


//
// microsoft azure-sdk-for-js
// error: Expected a JavaScript or TypeScript module, but identified a Unknown module. Importing these types of modules is currently not supported.
//
// import {bufferToHex as bufferToHexAzure } from 'https://github.com/Azure/azure-sdk-for-js/blob/c0db437d6df024d945918983e55616a21fce207f/sdk/core/core-util/src/hex.ts';
// chai.assert.deepEqual(bufferToHexAzure(dataBuf), hexdata);

// 
// uniswap
// error Relative import path "cids" not prefixed with / or ./ or ../
// import { hexToUint8Array } from 'https://raw.githubusercontent.com/Uniswap/widgets/526fb755a3da39b51c102e587a419da7c8298c10/src/utils/contenthashToUri.ts';