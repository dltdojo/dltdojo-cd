// https://github.com/sigstore/sigstore/blob/95a529684bd0bfa20577d73bc597df60d0cea651/pkg/oauthflow/flow.go#L31
// https://github.com/panva/oauth4webapi
import { z } from "https://deno.land/x/zod@v3.20.5/mod.ts";
import * as oauth from "npm:oauth4webapi@2.1.0";
import { router } from "https://deno.land/x/rutt@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.178.0/http/mod.ts";
import { decode, validate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const OauthClientConfig = z.object({
  issuer: z.string().url(),
  clientId: z.string().min(3),
  clientSecret: z.string().min(3),
  grantRedirectURI: z.string().url(),
  scopes: z.string().array(),
});

// https://github.com/gossi/unidancing/blob/6f58766978532afce8acead5e515b7cf20fea1b4/gatekeeper/src/index.ts
class OauthClient {
  #codeVerifier: string;
  #config: z.infer<typeof OauthClientConfig>;
  #as!: oauth.AuthorizationServer;
  #client: oauth.Client;

  constructor(config: z.infer<typeof OauthClientConfig>) {
    this.#config = config;
    this.#codeVerifier = oauth.generateRandomCodeVerifier();
    this.#client = {
      client_id: this.#config.clientId,
      client_secret: this.#config.clientSecret,
    };
  }
  async readServerOidcConfigurate() {
    if (!this.#as) {
      const issuer = new URL(this.#config.issuer);
      const response = await oauth.discoveryRequest(issuer, {
        algorithm: "oidc",
      });
      this.#as = await oauth.processDiscoveryResponse(issuer, response);
    }
  }
  async getAuthorizationURL() {
    const codeChallenge = await oauth.calculatePKCECodeChallenge(
      this.#codeVerifier,
    );
    const codeChallengeMethod = "S256";

    const loginUrl = new URL(this.#as.authorization_endpoint as string);
    loginUrl.searchParams.set("client_id", this.#config.clientId);
    loginUrl.searchParams.set("code_challenge", codeChallenge);
    loginUrl.searchParams.set("code_challenge_method", codeChallengeMethod);
    loginUrl.searchParams.set("redirect_uri", this.#config.grantRedirectURI);
    loginUrl.searchParams.set("response_type", "code");
    loginUrl.searchParams.set("scope", this.#config.scopes.join(" "));

    return loginUrl;
  }

  // callback url
  // router.get('/callback', async (req, env: Env) => {
  // const grantCodeResult = await odicClient.grantCode(req.url);

  async grantCode(url: string | URL) {
    const params = oauth.validateAuthResponse(
      this.#as,
      this.#client,
      typeof url === "string" ? new URL(url) : url,
      oauth.expectNoState,
    );

    if (oauth.isOAuth2Error(params)) {
      console.log("error", params);
      throw new Error(); // Handle OAuth 2.0 redirect error
    }

    const response = await oauth.authorizationCodeGrantRequest(
      this.#as,
      this.#client,
      params,
      this.#config.grantRedirectURI,
      this.#codeVerifier,
    );

    let challenges: oauth.WWWAuthenticateChallenge[] | undefined;
    if ((challenges = oauth.parseWwwAuthenticateChallenges(response))) {
      for (const challenge of challenges) {
        console.log("challenge", challenge);
      }
      throw new Error(); // Handle www-authenticate challenges as needed
    }
    const result = await response.json();
    return result;
  }

  async refresh(token: string) {
    const response = await oauth.refreshTokenGrantRequest(
      this.#as,
      this.#client,
      token,
    );

    // ... same as above... :/
    const result = await response.json();
    return result;
  }
}

const CLIENT_ID = Deno.env.get("OIDC_CLIENT_ID") ?? await Deno.readTextFile('./.env-client-id')
const CLIENT_SECRET = Deno.env.get("OIDC_CLIENT_SECRET") ?? await Deno.readTextFile('./.env-client-secret')
const OIDC_ISSUER = Deno.env.get("OIDC_ISSUER") ?? await Deno.readTextFile('./.env-issuer-vault')

// https://developer.hashicorp.com/vault/tutorials/auth-methods/oidc-identity-provider
const oclient = new OauthClient({
  issuer: OIDC_ISSUER,
  clientId: CLIENT_ID.trim(),
  clientSecret: CLIENT_SECRET.trim(),
  grantRedirectURI: "http://localhost:8000/callback",
  scopes: [
    "openid",
    "user",
    "groups",
  ],
});

const htmlPage = (body?: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>cd23/dafu/hack/oidc</title>
</head>
<body >
<h1>${body ?? 'HELLOWORLD'}</h1>
</body>
</html>`
}

const Tool = {
  respJson: (data: Record<string, string>) => {
    const body = JSON.stringify(data, null, 2);
    return new Response(body, {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  },
  respHtml200Ok: (html: string) => {
    return new Response(
      html,
      { headers: { "content-type": "text/html" } },
    );
  },
}

const Api = {
  callack: async (req: Request) => {
    const grantCodeJson = await oclient.grantCode(req.url)
    console.log(grantCodeJson)
    // https://developer.okta.com/blog/2020/09/14/deno-with-auth
    //  const user = parseJwt(data.id_token);
    // req.app.locals.user = user;
    // req.app.locals.isAuthenticated = true;
    // res.location(req.query.state.split(':')[1] || '/').sendStatus(302);
    let msg = undefined
    if (grantCodeJson.id_token) {
      console.log(grantCodeJson.id_token)
      const decodeIdToken = decode(grantCodeJson.id_token)
      console.log(decodeIdToken)
      const { header, payload, signature } = validate(decodeIdToken)
      console.log(payload)
      msg = htmlPage(`callback ok, username is ${payload.username}`)
    } else {
      msg = htmlPage('callback error')
    }
    return Tool.respHtml200Ok(msg);
  },
}

await oclient.readServerOidcConfigurate();
const loginUrl = await oclient.getAuthorizationURL();
console.log(loginUrl.toString());

const handlerRutt = router({
  "/callback": (_req) => Api.callack(_req),
});

await serve(handlerRutt, { port: 8000 });