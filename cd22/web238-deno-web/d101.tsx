/** @jsx h */
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { h, Component } from "https://esm.sh/preact@10.11.3";
import { renderToString } from "https://esm.sh/preact-render-to-string@5.2.6?deps=preact@10.11.3";

async function foo(){
  return await (await fetch('https://jsonplaceholder.typicode.com/todos/1')).json();
}

function MyComponent({v101}) {
  return <div>
    <p class="text(center 1xl)">Value: {v101}</p>
  </div> 
}

function Page({param101}) {
  return (
    <div>
      <h1 class="font-bold text(center 4xl white sm:gray-800 md:pink-700)">Current time</h1>
      <p class="text(center 2xl)">{new Date().toLocaleString()}</p>
      <MyComponent v101="hello"/>
      <pre>{JSON.stringify(param101)}</pre>
    </div>
  );
}

async function handler(_req: Request): Response {
  const jsonr1 = await foo();
  jsonr1["date"] = new Date().toLocaleString();
  const page = renderToString(<Page param101={jsonr1}/>);
  const html = `<!DOCTYPE html>
  <html lang="en" hidden>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="module" src="https://cdn.skypack.dev/twind/shim"></script>
    <title>Hello</title>
  </head>
  <body>${page}</body>
  </html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
serve(handler);