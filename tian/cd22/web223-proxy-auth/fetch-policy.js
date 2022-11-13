import opa from "https://unpkg.com/@open-policy-agent/opa-wasm@1.8.0/dist/opa-wasm-browser.esm.js";
import chai from "https://esm.sh/chai@4.3.6";
// docker compose up
// read local policy.wasm
//const file = await Deno.readFile("policy.wasm");
//const policy = await opa.loadPolicy(file.buffer.slice(0, file.length));
// fetch policy.wasm
const remoteResp = await fetch("http://localhost:8103/policy.wasm");
const remoteArrayBuffer = await remoteResp.arrayBuffer();
const policy = await opa.loadPolicy(remoteArrayBuffer);

const input1 = { "foo": "bar" };
const result1 = policy.evaluate(input1);
console.log(result1)
chai.assert.equal(result1[0].result, false);
const foo = {
      X_FORWARDED_URI: "/foo.html",
      method: "GET",
    };
// wasm case : without wrap input in json, but input.xxx in rego
// opa rest /v1/data POST json body: with wrap input in post json body.   
const result2 = policy.evaluate(foo);
console.log(result2)
chai.assert.equal(result2[0].result, true);

