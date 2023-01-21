import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
const document = new DOMParser().parseFromString(
  `<!DOCTYPE html>
  <html lang="en">
    <head><meta charset="UTF-8"><title>SSG Js+DOM 2022</title></head>
    <body><p id="demo"></p></body>
  </html>`,
  "text/html",
);
document.getElementById("demo").innerHTML = `SSG: 🔑🗝📦🔗⌛🦉🧩🎭🛂💸 ${new Date()} !`;
const htmlSSG = document.documentElement.outerHTML;
serve((_req) => {
  return new Response(htmlSSG, {
    headers: { "content-type": "text/html" },
  });
}, { port: 3000 });
