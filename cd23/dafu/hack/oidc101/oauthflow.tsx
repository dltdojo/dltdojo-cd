// https://github.com/gossi/unidancing/blob/6f58766978532afce8acead5e515b7cf20fea1b4/gatekeeper/src/index.ts
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
  async readServer() {
    if (!this.#as) {
      const issuer = new URL(this.#config.issuer);
      const response = await oauth.discoveryRequest(issuer, {
        algorithm: "oauth2",
      });
      this.#as = await oauth.processDiscoveryResponse(issuer, response);
    }
  }
}
