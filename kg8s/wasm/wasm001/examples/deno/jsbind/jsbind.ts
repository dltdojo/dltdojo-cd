//
// wasm-pack build --target web
// deno run -A jsbind.ts 
//
import { serve } from "https://deno.land/std@0.127.0/http/server.ts";
import init, { getCsfYaml, hpkeKeyGen, Foo } from '../../../jsbind/pkg/jsbind.js';

function handler(req: Request): Response {
    let x = new Foo().getCsfYaml();
    return new Response(x);
}

async function callWasm() {
    await init();
}

callWasm();

serve(handler, { port: 8000 });
console.log("http://localhost:8000/");
