// https://github.com/sigstore/sigstore/blob/95a529684bd0bfa20577d73bc597df60d0cea651/pkg/oauthflow/flow.go#L31
// https://github.com/panva/oauth4webapi
import { z } from "https://deno.land/x/zod@v3.20.5/mod.ts";
import * as oauth from "npm:@panva/oauth4webapi";

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

// https://developer.hashicorp.com/vault/tutorials/auth-methods/oidc-identity-provider
const oclient = new OauthClient({
  issuer:
    "http://vault101.default.svc:8200/v1/identity/oidc/provider/my-provider",
  clientId: Deno.env.get("OIDC_CLIENT_ID") ?? "blahblah1234",
  clientSecret: Deno.env.get("OIDC_CLIENT_SECRET") ?? "blahblah1234",
  grantRedirectURI: "http://localhost:8000/callback",
  scopes: [
    "user",
    "groups",
  ],
});

await oclient.readServerOidcConfigurate();
const loginUrl = await oclient.getAuthorizationURL();
console.log(loginUrl.toString());
