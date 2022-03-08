//
// cargo build --target wasm32-wasi -p wapp
// deno run -A wasi.ts -- -h
// 
import Context from "https://deno.land/std@0.127.0/wasi/snapshot_preview1.ts";

const context = new Context({
  args: Deno.args,
  env: Deno.env.toObject(),
});

const binary = await Deno.readFile("../../target/wasm32-wasi/debug/wapp.wasm");
const module = await WebAssembly.compile(binary);
const instance = await WebAssembly.instantiate(module, {
  "wasi_snapshot_preview1": context.exports,
});

context.start(instance);