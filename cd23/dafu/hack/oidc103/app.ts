// https://github.com/sigstore/sigstore/blob/95a529684bd0bfa20577d73bc597df60d0cea651/pkg/oauthflow/flow.go#L31
// https://github.com/panva/oauth4webapi
import "https://deno.land/std@0.178.0/dotenv/load.ts";
import { Utils, ZodSchema, ZEnum, z, oauth, router, serve, decode, validate, Scopes } from './deps.ts'
import { Page } from './backpage.tsx'


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
  #config: z.infer<typeof ZodSchema.oauthClientConfig>;
  #as!: oauth.AuthorizationServer;
  #client: oauth.Client;

  constructor(issuer: z.infer<typeof ZEnum.IdentityProvider>) {
    const config = {
      issuer: Deno.env.get(`${issuer}_OIDC_ISSUER`) ?? 'NULL',
      clientId: Deno.env.get(`${issuer}_OIDC_CLIENT_ID`) ?? 'NULL',
      clientSecret: Deno.env.get(`${issuer}_OIDC_CLIENT_SECRET`),
      grantRedirectURI: Deno.env.get(`${issuer}_OIDC_CALLBACK`) ?? 'NULL',
      scopes: Scopes[issuer],
      issuerType: issuer
    }

    console.log(config)

    this.#config = config;
    this.#codeVerifier = oauth.generateRandomCodeVerifier();
    this.#client = {
      client_id: this.#config.clientId,
      client_secret: this.#config.clientSecret,
      token_endpoint_auth_method: this.#config.issuerType === ZEnum.IdentityProvider.enum.SIGSTORE ? "none" : "client_secret_basic"
    };

    // pass github well-known oidc discovery
    if (this.#config.issuerType === ZEnum.IdentityProvider.enum.GITHUB) {
      this.#as = AuthServerGithub
    }


  }
  async readServerOidcConfigurate() {
    if (!this.#as) {
      const issuer = new URL(this.#config.issuer);
      try {
        const response = await oauth.discoveryRequest(issuer, {
          algorithm: "oidc",
        });
        this.#as = await oauth.processDiscoveryResponse(issuer, response);
      } catch (error) {
        console.error(error)
      }
    }
  }
  async getAuthorizationURL() {
    if (this.#as) {
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
    } else {
      return new URL('http://localhost/error-get-authorization-url')
    }
  }

  async userInfo(accessToken: string) {
    const response = await oauth.userInfoRequest(this.#as, this.#client, accessToken);
    const result: oauth.UserInfoResponse = await response.json();
    return result
  }

  // callback url
  // router.get('/callback', async (req, env: Env) => {
  // const grantCodeResult = await odicClient.grantCode(req.url);

  // microsoft callback url: "http://localhost:8000/callback-azure?code=xxxxx&state=xxxx"
  async grantCode(url: string | URL) {
    const codeUrl = typeof url === "string" ? new URL(url) : url;
    const state = codeUrl.searchParams.get('state');

    // NOTE: sigstore callback with empty state


    const params = oauth.validateAuthResponse(
      this.#as,
      this.#client,
      codeUrl,
      this.#config.issuerType === ZEnum.IdentityProvider.enum.SIGSTORE ? oauth.skipStateCheck : oauth.expectNoState,
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

// https://developer.hashicorp.com/vault/tutorials/auth-methods/oidc-identity-provider

const Api = {
  root: async (req: Request, oclientMap: { vault: OauthClient, sigstore: OauthClient }) => {
    const vaultLogin = await oclientMap.vault.getAuthorizationURL();
    console.log(vaultLogin.toString());
    const sigstoreLoginUrl = (await oclientMap.sigstore.getAuthorizationURL()).toString()
    console.log(sigstoreLoginUrl)
    return Utils.respHtml200Ok(Page.htmlPage({
      body: 'index page',
      vaultLoginUrl: vaultLogin.toString(),
      sigstoreLoginUrl,
    }))
  },

  callack: async (req: Request, oclient: OauthClient) => {

    const callbackGrantCodeUrl = req.url;
    // http://localhost:8000/callback?code=PYYziOGffjzB3OM6VfNbZj0UydKMDHmX
    // console.log(callbackGrantCodeUrl)
    console.log(req)

    let msg = undefined
    if (oclient) {
      const grantCodeJson = await oclient.grantCode(callbackGrantCodeUrl)
      console.log(grantCodeJson)
      // https://developer.okta.com/blog/2020/09/14/deno-with-auth
      //  const user = parseJwt(data.id_token);
      // req.app.locals.user = user;
      // req.app.locals.isAuthenticated = true;
      // res.location(req.query.state.split(':')[1] || '/').sendStatus(302);
      if (grantCodeJson.id_token) {
        console.log(grantCodeJson.id_token)
        const decodeIdToken = decode(grantCodeJson.id_token)
        console.log(decodeIdToken)
        const { header, payload, signature } = validate(decodeIdToken)
        console.log(payload)
        // vault oidc email in payload.contact.email
        const body = `callback ok, id_token username is ${payload.username ?? 'null'} , email is ${payload.email ?? 'null'}`
        msg = Page.htmlPage({ body })

      } else if (grantCodeJson.access_token) {
        // Github 回傳非 id token 需要根據 access token 去 userinfo url 取得，也就是後端總共要發出兩次 request，第一次取得 access token 第二次取得 userinfo。因為 userinfo 不是 id token 非 JWT 格式。 
        // Github redirect access_token
        // https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/identifying-and-authorizing-users-for-github-apps
        //
        const userinfo = await oclient.userInfo(grantCodeJson.access_token);
        console.log(userinfo)
        const body = `callback ok, email is ${userinfo.email ?? 'undefinded'}, name is ${userinfo.name ?? 'undefinded'}, github login is ${userinfo.login ?? 'undefinded'}`
        msg = Page.htmlPage({ body })
      } else {
        msg = Page.htmlPage({ body: 'callback error' })
      }
    } else {
      msg = Page.htmlPage({ body: 'request url error' })
    }
    return Utils.respHtml200Ok(msg);
  },
}

const startApp = async () => {
  //const oclientGithub = new OauthClient(ZEnum.IdentityProvider.enum.GITHUB);
  //await oclientGithub.readServerOidcConfigurate();

  const oclientVault = new OauthClient(ZEnum.IdentityProvider.enum.VAULT);
  await oclientVault.readServerOidcConfigurate();

  //const oclientAzure = new OauthClient(ZEnum.IdentityProvider.enum.MICROSOFT);
  //await oclientAzure.readServerOidcConfigurate();

  //const oclientGoogle = new OauthClient(ZEnum.IdentityProvider.enum.GOOGLE);
  //await oclientGoogle.readServerOidcConfigurate();

  const oclientSigstore = new OauthClient(ZEnum.IdentityProvider.enum.SIGSTORE);
  await oclientSigstore.readServerOidcConfigurate();

  const handlerRutt = router({
    "/": (_req) => Api.root(_req, { vault: oclientVault, sigstore: oclientSigstore }),
    "/callback-vault": (_req) => Api.callack(_req, oclientVault),
    "/callback": (_req) => Api.callack(_req, oclientSigstore),
    //"/callback-google": (_req) => Api.callack(_req, oclientGithub),
    //"/callback-azure": (_req) => Api.callack(_req, oclientAzure),
    //"/callback-google": (_req) => Api.callack(_req, oclientGoogle),
  });

  await serve(handlerRutt, { port: 8000 });
}

await startApp()