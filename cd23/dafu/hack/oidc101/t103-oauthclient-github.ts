// https://github.com/sigstore/sigstore/blob/95a529684bd0bfa20577d73bc597df60d0cea651/pkg/oauthflow/flow.go#L31
// https://github.com/panva/oauth4webapi
import "https://deno.land/std@0.178.0/dotenv/load.ts";
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

// https://fusionauth.io/docs/v1/tech/identity-providers/openid-connect/github
//  GitHub has not implemented a well-known configuration endpoint, so you will need to disable the Discover endpoints field and specify the endpoints manually. The values for these fields are:
// Authorization endpoint - https://github.com/login/oauth/authorize
// Token endpoint - https://github.com/login/oauth/access_token
// Userinfo endpoint - https://api.github.com/user
// You will need to specify user:email as a Scope for your application. 

const AuthServerGithub: oauth.AuthorizationServer = {
  authorization_endpoint: 'https://github.com/login/oauth/authorize',
  token_endpoint: 'https://github.com/login/oauth/access_token',
  userinfo_endpoint: 'https://api.github.com/user',
  issuer: 'https://github.com/login/oauth'
}

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
      // pass github well-known oidc discovery
      if (this.#config.issuer.includes('github.com')) {
        this.#as = AuthServerGithub
      } else {
        const issuer = new URL(this.#config.issuer);
        const response = await oauth.discoveryRequest(issuer, {
          algorithm: "oidc",
        });
        this.#as = await oauth.processDiscoveryResponse(issuer, response);
      }
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

  async userInfo(accessToken: string) {
    const response = await oauth.userInfoRequest(this.#as, this.#client, accessToken);
    const result: oauth.UserInfoResponse = await response.json();
    return result
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

    console.log('===> grantCode params : ', params)

    const response = await oauth.authorizationCodeGrantRequest(
      this.#as,
      this.#client,
      params,
      this.#config.grantRedirectURI,
      this.#codeVerifier,
    );

    console.log('===> grantCode authorizationCodeGrantRequest response : ', response)

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

const CLIENT_ID = Deno.env.get("GITHUB_OIDC_CLIENT_ID") ?? 'NULL'
const CLIENT_SECRET = Deno.env.get("GITHUB_OIDC_CLIENT_SECRET") ?? 'NULL'
const OIDC_ISSUER = Deno.env.get("GITHUB_OIDC_ISSUER") ?? 'NULL'

// 
// https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/identifying-and-authorizing-users-for-github-apps
// Github Note: You don't need to provide scopes in your authorization request. Unlike traditional OAuth, the authorization token is limited 
// to the permissions associated with your GitHub App and those of the user.
//
const Scopes = {
  VAULT: [
    "openid",
    "user",
    "groups",
  ],
  GITHUB: []
}

// https://developer.hashicorp.com/vault/tutorials/auth-methods/oidc-identity-provider
const oclient = new OauthClient({
  issuer: OIDC_ISSUER,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  grantRedirectURI: "http://localhost:8000/callback",
  scopes: Scopes.GITHUB,
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

const _ExampleVaultIdToken = `
{
  at_hash: "i8ANGnGH6V_wXtAFBbAQdw",
  aud: "GnzKrJYO4wB6M4HrFNyaFvaK7tdKzSzd",
  c_hash: "NJGz4eRV9oXHQ1bahv0pEw",
  contact: { email: "vault@hashicorp.com", phone_number: "123-456-7890" },
  exp: 1678081037,
  groups: [ "engineering" ],
  iat: 1678079237,
  iss: "http://vault101.default.svc:8200/v1/identity/oidc/provider/my-provider",
  namespace: "root",
  sub: "7d21f0b1-f37a-49c8-2db0-830ce25fb383",
  username: "end-user"
}
`

const _ExampleGithubUserInfo = `
{
  login: "y12studio",
  id: 1800087,
  node_id: "xxx",
  avatar_url: "https://avatars.githubusercontent.com/u/1840874?v=4",
  gravatar_id: "",
  url: "https://api.github.com/users/y12studio",
  html_url: "https://github.com/y12studio",
  followers_url: "https://api.github.com/users/y12studio/followers",
  following_url: "https://api.github.com/users/y12studio/following{/other_user}",
  gists_url: "https://api.github.com/users/y12studio/gists{/gist_id}",
  starred_url: "https://api.github.com/users/y12studio/starred{/owner}{/repo}",
  subscriptions_url: "https://api.github.com/users/y12studio/subscriptions",
  organizations_url: "https://api.github.com/users/y12studio/orgs",
  repos_url: "https://api.github.com/users/y12studio/repos",
  events_url: "https://api.github.com/users/y12studio/events{/privacy}",
  received_events_url: "https://api.github.com/users/y12studio/received_events",
  type: "User",
  site_admin: false,
  name: "Joye Lin",
  company: "@dltdojo ",
  blog: "https://dltdojo.org",
  location: "Taichung, Taiwan",
  email: "y12studio@gmail.com",
  hireable: true,
  bio: null,
  twitter_username: null,
  public_repos: 78,
  public_gists: 46,
  followers: 64,
  following: 9,
  created_at: "2012-06-12T03:09:05Z",
  updated_at: "2023-02-22T11:49:37Z"
}`


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
      msg = htmlPage(`callback ok, id_token username is ${payload.username ?? 'undefinded'}`)
    } else if (grantCodeJson.access_token) {
      // Github 回傳非 id token 需要根據 access token 去 userinfo url 取得，也就是後端總共要發出兩次 request，第一次取得 access token 第二次取得 userinfo。因為 userinfo 不是 id token 非 JWT 格式。 
      // Github redirect access_token
      // https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/identifying-and-authorizing-users-for-github-apps
      //
      const userinfo = await oclient.userInfo(grantCodeJson.access_token);
      console.log(userinfo)
      msg = htmlPage(`callback ok, email is ${userinfo.email ?? 'undefinded'}, name is ${userinfo.name ?? 'undefinded'}, github login is ${userinfo.login ?? 'undefinded'}`)
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