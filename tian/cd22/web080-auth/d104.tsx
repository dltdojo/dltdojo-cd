/** @jsx h */
import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import {
  type Cookie,
  deleteCookie,
  getCookies,
  setCookie,
} from "https://deno.land/std@0.170.0/http/mod.ts";
import { router } from "https://deno.land/x/rutt@0.0.14/mod.ts";
import { h } from "https://esm.sh/preact@10.5.15";
import { renderToString } from "https://esm.sh/preact-render-to-string@5.1.19?deps=preact@10.5.15";

interface IUser {
  username?: string;
  password?: string;
}
const db123: IUser[] = [];

const sessionDb = {};

function App() {
  const shoot = () => {
    alert("Great Shot!");
  };
  return (
    <div>
      <h2>Hello SSR</h2>
      <span>username:</span>
      <input type="text" id="username" maxlength="25"></input>
      <span>password:</span>
      <input type="text" id="password" maxlength="25"></input>
    </div>
  );
}

function rootpage(): Response {
  const body: string = renderToString(<App />);
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>web080-auth</title>
  </head>
  <body >
    <h3><a href="/onlyauth">ONLY AUTH</a></h3>
    <h3><a href="/api/logout">Logout</a></h3>
    <div id="root">${body}</div>
    <div>
    <button onclick="clickRegister()">Register</button>
    <button onclick="clickLogin()">Login</button>
    </div>
    <script>
    async function clickRegister() {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        let resp = await fetch("api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({username, password})
      })
        let v = await resp.json();
        console.log(v);
    }
    async function clickLogin() {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        let resp = await fetch("api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({username, password})
      })
        let v = await resp.json();
        console.log(v);
    }
    </script>
  </body>
  </html>`;
  return new Response(
    html,
    { headers: { "content-type": "text/html" } },
  );
}

function pageAuth(req: Request): Response {
  const { sessionId } = getCookies(req.headers);
  const sessionObj = sessionDb[sessionId];
  console.log(sessionDb);
  if (sessionObj && sessionObj.loggedIn) {
    return new Response("OnlyAuth", { status: 200 });
  } else {
    return new Response("403 Forbidden", { status: 403 });
  }
}

function respJson(data: unknown) {
  const body = JSON.stringify(data, null, 2);
  return new Response(body, {
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function apiRegister(req: Request) {
  const body = await req.json();
  db123.push(body);
  return respJson({ message: "OK" });
}

async function apiLogout(req: Request) {
  const url = new URL(req.url);
  // Failed to execute 'set' on 'Headers': Headers are immutable
  // const resp = Response.redirect(`${url.origin}/`);
  const resp = new Response(null, {
    headers: { location: `${url.origin}/` },
    status: 302,
  });
  deleteCookie(resp.headers, "sessionId", { path: "/" });
  return resp;
}

async function apiLogin(req: Request) {
  const body = await req.json();
  const user: IUser = db123.find((entry) =>
    entry.username == body.username &&
    entry.password == body.password
  );
  if (user === undefined) {
    new Response("username or password error", { status: 500 });
  } else {
    // create a new random session id
    const sessionId = Math.random().toString(36).substring(2, 16);
    sessionDb[sessionId] = { loggedIn: true };
    const cookie: Cookie = {
      name: "sessionId",
      value: sessionId,
      path: "/",
      sameSite: "Lax",
    };
    const resp: Response = respJson({ message: "OK" });
    setCookie(resp.headers, cookie);
    return resp;
  }
}

const handler = router({
  "/": (_req) => rootpage(),
  "/api/register": (_req) => apiRegister(_req),
  "/api/login": (_req) => apiLogin(_req),
  "/api/logout": (_req) => apiLogout(_req),
  "/onlyauth": (_req) => pageAuth(_req),
});

await serve(handler);
