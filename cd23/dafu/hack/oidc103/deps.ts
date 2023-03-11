import { z } from "https://deno.land/x/zod@v3.20.5/mod.ts";
export { z } 
export * as oauth from "npm:oauth4webapi@2.1.0";
export { router } from "https://deno.land/x/rutt@0.1.0/mod.ts";
export { serve } from "https://deno.land/std@0.178.0/http/mod.ts";
export { decode, validate } from "https://deno.land/x/djwt@v2.8/mod.ts";
export { h } from "https://esm.sh/preact@10.11.2";
export { renderToString } from "https://esm.sh/preact-render-to-string@5.2.6";

export const Utils = {
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

export const ZEnum = {
    IdentityProvider: z.enum(["SIGSTORE", "GITHUB", "VAULT", "GOOGLE", 'MICROSOFT']),
}

export const ZodSchema = {
    oauthClientConfig: z.object({
        issuer: z.string().url(),
        clientId: z.string().min(3),
        clientSecret: z.string().min(3),
        grantRedirectURI: z.string().url(),
        scopes: z.string().array(),
        issuerType: ZEnum.IdentityProvider,
    }),

    pageHome: z.object({
        body: z.string().min(5).default('HELLO'),
        githubLoginUrl: z.string().url().optional(),
        vaultLoginUrl: z.string().url().optional(),
        microsoftLoginUrl: z.string().url().optional(),
        googleLoginUrl: z.string().url().optional(),
        sigstoreLoginUrl: z.string().url().optional()
    })
}

// 
// https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/identifying-and-authorizing-users-for-github-apps
// Github Note: You don't need to provide scopes in your authorization request. Unlike traditional OAuth, the authorization token is limited 
// to the permissions associated with your GitHub App and those of the user.
//
export const Scopes = {
  VAULT: [
    "openid",
    "user",
    "groups",
  ],
  SIGSTORE: ['openid','email'],
  GITHUB: [],
  GOOGLE: ['openid','https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'],
  MICROSOFT: ['openid']
}