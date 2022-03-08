import { assertEquals } from "https://deno.land/std@0.128.0/testing/asserts.ts";
import init, { getCsfYaml, hpkeKeyGen, Foo } from '../../../jsbind/pkg/jsbind.js';

Deno.test("hello world #1", () => {
  const x = 1 + 2;
  assertEquals(x, 3);
});

Deno.test("Test #2", { permissions: { read: true } }, async () => {
  await init();
  let rand = new Uint8Array(32);
  window.crypto.getRandomValues(rand);
  const receiver_sk_pk: Uint8Array = hpkeKeyGen(rand);
  assertEquals(receiver_sk_pk.length, 64);
  //let skR = receiver_sk_pk.slice(0, 32);
  //let pkR = receiver_sk_pk.slice(32);
});
