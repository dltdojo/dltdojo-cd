/** @jsx h */
import {
  type Cookie,
  deleteCookie,
  getCookies,
  serve,
  setCookie,
} from "https://deno.land/std@0.178.0/http/mod.ts";
import { router } from "https://deno.land/x/rutt@0.1.0/mod.ts";
import { h } from "https://esm.sh/preact@10.11.2";
import { renderToString } from "https://esm.sh/preact-render-to-string@5.2.6";
import { create, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

type IUser = {
  username: string;
  password: string;
};

type CookieValue = {
  name101: string;
};

class UserSession {
  #sessionDb = new Map();
  setUserLoginedIn(username: string) {
    this.#sessionDb.set(username, { loggedIn: true });
  }
  getUser(id: string) {
    return this.#sessionDb.get(id);
  }
}

class UserDb {
  #db123: IUser[] = [];

  registerUser(body: IUser) {
    this.#db123.push(body);
  }

  authUser(username: string, password: string) {
    const user = this.#db123.find((entry) =>
      entry.username == username &&
      entry.password == password
    );
    return user;
  }
}

const userSession = new UserSession();

const userDb = new UserDb();

const Page = {
  serverSideGenApp: () => {
    return (
      <div>
        <h2>JWT Cookie Login Example (Backend TSX)</h2>
        <div style="margin:5px">
          <span>username:</span>
          <input type="text" id="username"></input>
        </div>
        <div style="margin:5px">
          <span>password:</span>
          <input type="text" id="password"></input>
        </div>
        <h3>
          <a href="/authonly">Auth Page with jwt cookie</a>
        </h3>
        <h3>
          <a href="/api/logout">Logout and remove jwt cookie</a>
        </h3>
        <h3>
          The CSS border: thick double sets the JSX-ServerSideGen-Area border.
        </h3>
      </div>
    );
  },

  homepage: (): Response => {
    const body: string = renderToString(<Page.serverSideGenApp />);
    const html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>cd23/dafu/hack/oidc</title>
    </head>
    <body >
    <h1>cd23/dafu/hack/oidc</h1>
    <div id="root" style="border: thick double #32a1ce; padding: 10px;">${body}</div>
      <div style="margin: 10px">
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
    return Tool.respHtml200Ok(html);
  },

  authOnly: async (req: Request): Promise<Response> => {
    const cookies = getCookies(req.headers);
    let resp = Tool.resp403Forbidden();
    if (cookies && cookies[Tool.COOKIE_SESSION_KEY]) {
      try {
        const payload = await verify(
          cookies[Tool.COOKIE_SESSION_KEY],
          Tool.JWTKEY,
        );
        if (payload) {
          const cookieValue = payload as CookieValue;
          const sessionObj = userSession.getUser(cookieValue.name101);
          if (sessionObj && sessionObj.loggedIn) {
            resp = Tool.respText200Ok("===> Auth Area <===");
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
    return resp;
  },
};

const Tool = {
  COOKIE_SESSION_KEY: Deno.env.get("COOKIE_SESSION_KEY") ??
    `t101-${Math.random().toString(36).substring(2, 7)}`,

  JWTKEY: await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-256" },
    true,
    ["sign", "verify"],
  ),

  EXTERNAL_URL_ORIGIN: Deno.env.get("EXTERNAL_URL_ORIGIN") ?? "localhost:8000",

  jwtCreateAsync: async (target: CookieValue) => {
    return await create(
      { alg: "HS256", typ: "JWT" },
      target,
      Tool.JWTKEY,
    );
  },

  setJwtCookieAsync: async (headers: Headers, value: CookieValue) => {
    setCookie(
      headers,
      await Tool.jwtCookieCreateAsync(value),
    );
  },

  deleteCookie: (headers: Headers) => {
    deleteCookie(headers, Tool.COOKIE_SESSION_KEY, { path: "/" });
  },

  jwtCookieCreateAsync: async (target: CookieValue) => {
    const jwtCookieValue101: string = await Tool.jwtCreateAsync(
      target,
    );
    const cookie: Cookie = {
      name: Tool.COOKIE_SESSION_KEY,
      value: jwtCookieValue101,
      path: "/",
      sameSite: "Lax",
    };
    return cookie;
  },

  respHtml200Ok: (html: string) => {
    return new Response(
      html,
      { headers: { "content-type": "text/html" } },
    );
  },

  respText200Ok: (text: string) => {
    return new Response(
      text,
      { status: 200 },
    );
  },

  resp403Forbidden: () => {
    return new Response("403 Forbidden", { status: 403 });
  },

  resp302Redirect: (location: string, body?: string) => {
    return new Response(body, {
      headers: { location },
      status: 302,
    });
  },

  respJson: (data: Record<string, string>) => {
    const body = JSON.stringify(data, null, 2);
    return new Response(body, {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  },
};

const Api = {

  register: async (req: Request) => {
    const body = await req.json();
    userDb.registerUser(body);
    return Tool.respJson({ message: "OK" });
  },

  logout: (req: Request) => {
    // const url = new URL(req.url);
    // Failed to execute 'set' on 'Headers': Headers are immutable
    // const resp = Response.redirect(`${url.origin}/`);
    // const resp = Tool.resp302Redirect(Tool.EXTERNAL_URL_ORIGIN);
    const resp = Tool.respText200Ok("===> Logout Done <===");
    Tool.deleteCookie(resp.headers);
    return resp;
  },

  login: async (req: Request): Promise<Response> => {
    const body = await req.json();
    const user = userDb.authUser(body.username, body.password);
    if (user && user.username) {
      const cookieValueToSigned = {
        name101: user.username,
      };
      const resp = Tool.respJson({ message: "OK" });
      await Tool.setJwtCookieAsync(resp.headers, cookieValueToSigned);
      console.log(resp);
      userSession.setUserLoginedIn(user.username);
      return resp;
    } else {
      return new Response("username or password error", { status: 500 });
    }
  },
};

const handlerRutt = router({
  "/": (_req) => Page.homepage(),
  "/api/register": (_req) => Api.register(_req),
  "/api/login": (_req) => Api.login(_req),
  "/api/logout": (_req) => Api.logout(_req),
  "/authonly": (_req) => Page.authOnly(_req),
});

await serve(handlerRutt, { port: 8000 });
