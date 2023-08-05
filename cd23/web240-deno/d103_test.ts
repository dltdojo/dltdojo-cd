import { delay } from "https://deno.land/std@0.197.0/async/delay.ts";

const resp1 = await fetch("http://localhost:8000/", {
  method: "POST",
  body: JSON.stringify( {
    slug: "google102",
    url: "https://www.google.com"
  }),
});

console.log(resp1)

await delay(2000)

console.log(await fetch("http://localhost:8000/google102"))