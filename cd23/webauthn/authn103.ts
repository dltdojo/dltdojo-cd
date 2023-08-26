//  TODO 多重要素驗證 (Multi-factor authentication) : webauthn + OAuth2
// ref:
// - denoland/deno_kv_oauth: High-level OAuth 2.0 powered by Deno KV. https://github.com/denoland/deno_kv_oauth
// - [webauthn-open-source/fido2-lib: A node.js library for performing FIDO 2.0 / WebAuthn server functionality](https://github.com/webauthn-open-source/fido2-lib)
// - [dltdojo-cd/cd22/web090-passkeys at main · dltdojo/dltdojo-cd](https://github.com/dltdojo/dltdojo-cd/tree/main/cd22/web090-passkeys)
// - [denoland/deno_kv_oauth: High-level OAuth 2.0 powered by Deno KV.](https://github.com/denoland/deno_kv_oauth)
//
// The update features (dltdojo-cd/cd22/web090-passkeys/d104-authn.ts) are as follows:
// - Remove the external dependency of base64 lib and use deno std version instead.
// - Update Fido2Lib version.
// - Remove the external dependency of oak lib and directly use native Request/Response to remove the dependency.
// - Remove the oak session dependency and use deno kv and custom cookie instead.
// - Use deno kv to record users, eliminating the problem of record disappearing after restart.
//
import { z } from "https://deno.land/x/zod@v3.22.2/mod.ts";
import { Fido2Lib } from "https://deno.land/x/fido2@3.4.1/dist/main.js";
import {
  decode as decodeBase64Url,
  encode as encodeBase64Url,
} from "https://deno.land/std@0.198.0/encoding/base64url.ts";

import {
  type Cookie,
  deleteCookie,
  getCookies,
  getSetCookies,
  setCookie,
} from "https://deno.land/std@0.198.0/http/cookie.ts";

class Schema {
  static Authenticator = z.object({
    credId: z.string(),
    publicKey: z.string(),
    type: z.string(),
    transports: z.array(z.string()).optional(),
    counter: z.number(),
    created: z.date(),
  });

  static Token = z.object({
    username: z.string().min(3).max(32),
    token: z.instanceof(ArrayBuffer),
    expires: z.number(),
  });

  static User = z.object({
    userName: z.string().min(3).max(32),
    name: z.string(),
    registered: z.boolean(),
    authenticators: z.array(Schema.Authenticator),
    oneTimeToken: Schema.Token.optional(),
    recoveryEmail: z.string().optional(),
  });

  static ChallengeSession = z.object({
    challenge: z.string(),
    username: Schema.User.shape.userName,
  })
}

// session
// deno_kv_oauth/src/core.ts at main · denoland/deno_kv_oauth
// https://github.com/denoland/deno_kv_oauth/blob/main/src/core.ts

type ChallengeSession = z.infer<typeof Schema.ChallengeSession>;
type Authenticator = z.infer<typeof Schema.Authenticator>;
type Token = z.infer<typeof Schema.Token>;
type User = z.infer<typeof Schema.User>;

const kvdb = await Deno.openKv();

const HTML_ROOT = `
<!DOCTYPE html>
<html>
<head>
    <title>WebAuthn Registration 2023</title>
</head>
<body>
<h1>FIDO2/WebAuthn 104</h1>
<div>
  <p>Enter username</p>
  <input type="text" id="username" maxlength="25">
  <br/>
  <button onclick="clickRegister()">1. Register</button>
  <button onclick="clickAuthn()">2. Login/Authentication</button>
</div>
<script type="module">
import { base64 } from "https://deno.land/x/b64@1.1.27/src/base64.js";
globalThis.base64 = base64;
</script>
<script>
function clickRegister() {
    const username = document.getElementById("username").value;
    register(username);
}
function clickAuthn() {
    const username = document.getElementById("username").value;
    login(username);
}
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API#registration
async function register(username) {
	let name = username;
    let vbody = {username, name};
    //
    // 1. Server Sends Challenge, User Info, and Relying Party Info 
    //
    let resp = await fetch("webauthn/register", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(vbody)
	})
    let v = await resp.json();
    console.log(v);
    let publicKey = preformatMakeCredReq(v);
    //
    // 2. Browser Calls authenticatorMakeCredential() on Authenticator
    // 3. Authenticator Creates New Key Pair and Attestation
    // 4. Authenticator Returns Data to Browser 
    // 5. Browser Creates Final Data, Application sends response to Server 
    // 
    let navCredCreateResp = await navigator.credentials.create({ publicKey });
    // browser pop up window
    console.log("navCredCreateResp:", navCredCreateResp);
    makeCredResponse = {
        id: navCredCreateResp.id,
        rawId: base64.fromArrayBuffer(navCredCreateResp.rawId,true),
        transports: navCredCreateResp.response.getTransports ? navCredCreateResp.response.getTransports() : undefined,
        response: {
            attestationObject: base64.fromArrayBuffer(navCredCreateResp.response.attestationObject,true),
            clientDataJSON: base64.fromArrayBuffer(navCredCreateResp.response.clientDataJSON,true)
        },
        type: navCredCreateResp.type
    };
    console.log("makeCredResponse");
    console.log(makeCredResponse);
    //
    // 6. Server Validates and Finalizes Registration
    //
    let resp6 = await fetch("webauthn/attestation", { method: "POST", credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(makeCredResponse)
	});
    let resp6json = await resp6.json();
    console.log(resp6json);
}
//
// https://github.com/Hexagon/webauthn-skeleton/blob/4606a15ed5db93d16fcb506a05b831881bad020c/public/static/js/utils.js#L39
//
function preformatMakeCredReq(makeCredReq){
	makeCredReq.challenge = base64.toArrayBuffer(makeCredReq.challenge,true);
	makeCredReq.user.id = base64.toArrayBuffer(makeCredReq.user.id,true);
	// Decode id of each excludeCredentials
	if (makeCredReq.excludeCredentials) {
		makeCredReq.excludeCredentials = makeCredReq.excludeCredentials.map((e) => { return { id: base64.toArrayBuffer(e.id, true), type: e.type };});
	}
	return makeCredReq;
};
function preformatGetAssertReq(getAssert) {
	getAssert.challenge = base64.toArrayBuffer(getAssert.challenge,true);
	// Allow any credential, this will be handled later
	for(let allowCred of getAssert.allowCredentials) {
		allowCred.id = base64.toArrayBuffer(allowCred.id,true);
	}
	return getAssert;
};
const publicKeyCredentialToJSON = (pubKeyCred) => {
	if(pubKeyCred instanceof Array) {
		let arr = [];
		for(let i of pubKeyCred)
			arr.push(publicKeyCredentialToJSON(i));

		return arr;
	}
	if(pubKeyCred instanceof ArrayBuffer) {
		return base64.fromArrayBuffer(pubKeyCred,true);
	}
	if(pubKeyCred instanceof Object) {
		let obj = {};
		for (let key in pubKeyCred) {
			obj[key] = publicKeyCredentialToJSON(pubKeyCred[key]);
		}
		return obj;
	}
	return pubKeyCred;
};

async function login(username) {
    let resp1 = await fetch("webauthn/authn", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({username})
	});
	let respjson1 = await resp1.json();
	console.log("fetch authn:", respjson1);
    const publicKey = preformatGetAssertReq(respjson1);
    console.log("publicKey:", publicKey);
    let navCredGetResp = await navigator.credentials.get( { publicKey } );
    console.log("navCredGetResp:", navCredGetResp);
    let getAssertionResponse = publicKeyCredentialToJSON(navCredGetResp);
	console.log("getAssertionResponse",getAssertionResponse);

    const resp2 = await fetch("webauthn/attestation", {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(getAssertionResponse)
	});
	const respjson2 = await resp2.json();
    console.log(respjson2);
}
</script>
</body>
</html>
`;

class Fido2Utils {
  static RPINFO = {
    ORIGIN: Deno.env.get("ORIGIN") || "http://localhost:3000",
    RPID: Deno.env.get("RPID") || "localhost",
    RPNAME: "test-auth-server",
  };
  static Fido2 = new Fido2Lib({
    timeout: 60000,
    rpId: Fido2Utils.RPINFO.RPID,
    rpName: Fido2Utils.RPINFO.RPNAME,
    challengeSize: 128,
    attestation: "direct",
    cryptoParams: [-7, -257],
    authenticatorAttachment: undefined, // ["platform", "cross-platform"]
    authenticatorRequireResidentKey: false,
    authenticatorUserVerification: "preferred",
  });

  static getAllowCredentialsFromUserAuthenticators = (
    authenticators: Authenticator[],
  ) => {
    const allowCredentials = [];
    for (const authrRaw of authenticators) {
      const authr = Schema.Authenticator.parse(authrRaw);
      allowCredentials.push({
        type: authr.type,
        id: authr.credId,
        transports: authr.transports,
      });
    }
    return allowCredentials;
  };
}

class HtmlUtils {
  static respJson = (bodyObj: any, status = 200) => {
    return new Response(JSON.stringify(bodyObj), {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    });
  };

  static RESPNONE = new Response("none");

  static securityHeader = {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "unsafe-none",
    "X-Permitted-Cross-Domain-Policies": "none",
    "Clear-Site-Data": '"*"',
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Permissions-Policy": "microphone=(), geolocation=()",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'self'",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "unsafe-url",
    "Feature-Policy": "none",
  };
}

class UserUtils {
  static getUserByName = async (username: string): Promise<User> => {
    const key = ["user", username];
    return (await kvdb.get<User>(key)).value!;
  };
  static upsertUser = async (userRaw: User) => {
    const user = Schema.User.parse(userRaw);
    const userKey = ["user", user.userName];
    //const oldUser = await db.get<IUser>(userKey);
    const ok = await kvdb.set(userKey, user);
    if (!ok) throw new Error("Something went wrong.");
  };
}



class SessMgr {
  static RandomId = () => crypto.randomUUID();

  setPayload = async <T>(
    payload: T,
    key: string[],
    sessionTtlSeconds: number,
  ) => {
    await kvdb.set(key, payload, {
      expireIn: sessionTtlSeconds * 1000,
    });
  };

  getPayload = async <T>(key: string[]) => {
    const result = await kvdb.get<T>(key);
    return result.value;
  };

  deletePayload = async (key: string[]) => {
    await kvdb.delete(key);
  };

  getSessionFromRequestCookie = async <T>(
    req: Request,
    cookieName: string,
    keyPrefix: string,
  ) => {
    const sessionId = getCookies(req.headers)[cookieName];
    const sessionPayload: T | null = await this.getPayload<T>([
      keyPrefix,
      sessionId,
    ]);
    return { sessionId, sessionPayload };
  };

  setSessionCookie = (
    response: Response,
    cookieName: string,
    sessionId: string,
    isCookieSecure: boolean,
    sessionTtlSeconds: number,
  ) => {
    setCookie(response.headers, {
      ...CookieUtils.COOKIE_BASE,
      name: cookieName,
      value: sessionId,
      secure: isCookieSecure,
      maxAge: sessionTtlSeconds,
    });
  };

  deleteSessionAndCookie = async (
    response: Response,
    cookieName: string,
    key: string[],
  ) => {
    await this.deletePayload(key);
    deleteCookie(response.headers, cookieName);
  };
}

/** @see https://github.com/denoland/deno_kv_oauth/blob/6113e35885587eaeab34826b7fb728426efd152e/src/core.ts#L17C1-L24C74 */
const SOPT = {
  CHALLENGE: {
    cookieName: "challenge-session",
    sessionPrefix: "challenge_sessions",
    sessionTtlSeconds: 300, // 5 minutes
  },

  MEMBER: {
    sessionPrefix: "member_sessions",
    cookieName: "member-session",
    sessionTtlSeconds: 60 * 60, // 60 minutes
  },
};

type MemberSession = {
  username: string;
};

class CookieUtils {
  // Determines whether the request URL is of a secure origin using the HTTPS protocol.
  static isSecure = (requestUrl: string) =>
    new URL(requestUrl).protocol === "https:";

  // Dynamically prefixes the cookie name, depending on whether it's for a secure origin (HTTPS).
  static getCookieName = (name: string, isSecure: boolean) =>
    isSecure ? "__Host-" + name : name;

  static COOKIE_BASE = {
    path: "/",
    httpOnly: true,
    // 90 days
    maxAge: 7776000,
    sameSite: "Lax",
  } as Required<Pick<Cookie, "path" | "httpOnly" | "maxAge" | "sameSite">>;
}

class SessionUtils {
  static newChallengeSession = async (
    sessId: string,
    challenge: string,
    username: string,
    req: Request,
    resp: Response,
  ) => {
    const sessMgr = new SessMgr();
    // const sessId = SessMgr.RandomId()
    const sessDbKey = [SOPT.CHALLENGE.sessionPrefix, sessId];
    const payloadRaw: ChallengeSession = {
      challenge,
      username,
    };
    const payload = Schema.ChallengeSession.parse(payloadRaw);
    await sessMgr.setPayload(
      payload,
      sessDbKey,
      SOPT.CHALLENGE.sessionTtlSeconds,
    );
    // 會期綁定
    const isCookieSecure = CookieUtils.isSecure(req.url);
    const cookieName = CookieUtils.getCookieName(
      SOPT.CHALLENGE.cookieName,
      isCookieSecure,
    );
    sessMgr.setSessionCookie(
      resp,
      cookieName,
      sessId,
      isCookieSecure,
      SOPT.CHALLENGE.sessionTtlSeconds,
    );
  };

  static newMemberSession = async (
    sessId: string,
    username: string,
    req: Request,
    resp: Response,
  ) => {
    const sessMgr = new SessMgr();
    // const sessId = SessMgr.RandomId()
    const sessDbKey = [SOPT.MEMBER.sessionPrefix, sessId];
    const payload: MemberSession = {
      username,
    };
    await sessMgr.setPayload(payload, sessDbKey, SOPT.MEMBER.sessionTtlSeconds);
    // 會期綁定
    const isCookieSecure = CookieUtils.isSecure(req.url);
    const cookieName = CookieUtils.getCookieName(
      SOPT.MEMBER.cookieName,
      isCookieSecure,
    );
    sessMgr.setSessionCookie(
      resp,
      cookieName,
      sessId,
      isCookieSecure,
      SOPT.MEMBER.sessionTtlSeconds,
    );
  };
}

class Handlers {
  static handleLogin = async (req: Request) => {
    const postBody = await req.json();
    const username = postBody.username;
    const userInfo = await UserUtils.getUserByName(username);

    if (userInfo === undefined) {
      return new Response(`Username ${username} not found`, { status: 500 });
    } else {
      const authnOptionsRaw = await Fido2Utils.Fido2.assertionOptions();
      const authnOptions = {
        ...authnOptionsRaw,
        challenge: encodeBase64Url(authnOptionsRaw.challenge),
      };
      // Pass this, to limit selectable credentials for user... This may be set in response instead, so that
      // all of a users server (public) credentials isn't exposed to anyone
      authnOptions.allowCredentials = Fido2Utils
        .getAllowCredentialsFromUserAuthenticators(userInfo.authenticators);
      const response = HtmlUtils.respJson(authnOptions);
      // 新增登入挑戰會期
      const sessId = SessMgr.RandomId();
      await SessionUtils.newChallengeSession(
        sessId,
        authnOptions.challenge,
        username,
        req,
        response,
      );
      return response;
    }
  };

  static handleRegister = async (req: Request) => {
    const postBody = await req.json();
    const username = postBody.username;
    const userInfo = await UserUtils.getUserByName(username);
    if (userInfo && userInfo.registered) {
      return new Response(`Username ${username} already exists`, {
        status: 500,
      });
    }

    const registrationOptionsRaw = await Fido2Utils.Fido2.attestationOptions();
    const sessId = SessMgr.RandomId();
    const registrationOptions = {
      ...registrationOptionsRaw,
      user: {
        id: sessId,
        name: username,
        displayName: username,
      },
      challenge: encodeBase64Url(registrationOptionsRaw.challenge),
    };
    console.log("reg opt: ", registrationOptions);

    const userRaw: User = {
      userName: username,
      name: username,
      registered: false,
      authenticators: [],
      oneTimeToken: undefined,
      recoveryEmail: undefined,
    };

    const user = Schema.User.parse(userRaw);

    // 新增使用者註冊
    await UserUtils.upsertUser(user);
    const response = HtmlUtils.respJson(registrationOptions);
    // ref https://github.com/denoland/deno_kv_oauth/blob/6113e35885587eaeab34826b7fb728426efd152e/src/sign_in.ts#L55
    // 新增註冊會期
    await SessionUtils.newChallengeSession(
      sessId,
      registrationOptions.challenge,
      username,
      req,
      response,
    );
    return response;
  };

  static handleRegisterAttestation = async (
    postBody: any,
    challenge: string,
    userRaw: User,
  ): Promise<Response> => {
    let result = HtmlUtils.RESPNONE;
    postBody.rawId = decodeBase64Url(postBody.rawId).buffer;
    postBody.response.attestationObject =
      decodeBase64Url(postBody.response.attestationObject).buffer;
    const clientAttestationResponse = postBody;
    console.log(clientAttestationResponse);
    const attestationExpectations = {
      challenge,
      origin: Fido2Utils.RPINFO.ORIGIN,
      factor: "either",
    };
    const attResult = await Fido2Utils.Fido2.attestationResult(
      clientAttestationResponse,
      attestationExpectations,
    );

    console.log(attResult);

    if (attResult && attResult.authnrData) {
      const credId = encodeBase64Url(attResult.authnrData.get("credId"));
      const counter = attResult.authnrData.get("counter");

      const tokenRaw: Authenticator = {
        credId,
        publicKey: attResult.authnrData.get("credentialPublicKeyPem"),
        type: postBody.type,
        transports: postBody.transports,
        counter,
        created: new Date(),
      };

      const token = Schema.Authenticator.parse(tokenRaw);
      const aUser = Schema.User.parse(userRaw);

      const newAuthenticators = aUser.authenticators
        ? [...aUser.authenticators]
        : [];
      newAuthenticators.push(token);
      aUser.authenticators = newAuthenticators;
      aUser.registered = true;
      console.log("register end, db user: ", aUser);
      await UserUtils.upsertUser(aUser);
      result = HtmlUtils.respJson({ "attestation": "ok" });
    }
    return result;
  };

  static handleLoginAttestation = async (
    postBody: any,
    challenge: string,
    userRaw: User,
  ) => {
    postBody.rawId = decodeBase64Url(postBody.rawId).buffer;
    const aUser = Schema.User.parse(userRaw)
    const allowCredentials = Fido2Utils
      .getAllowCredentialsFromUserAuthenticators(aUser.authenticators);
    let winningAuthenticatorResult;
    for (const authrIdx in aUser.authenticators) {
      const authr = aUser.authenticators[parseInt(authrIdx, 10)];
      try {
        const assertionExpectations = {
          allowCredentials,
          challenge,
          origin: Fido2Utils.RPINFO.ORIGIN,
          factor: "either",
          publicKey: authr.publicKey,
          prevCounter: authr.counter,
          userHandle: authr.credId,
        };
        const authnResult = await Fido2Utils.Fido2.assertionResult(
          postBody,
          assertionExpectations,
        );
        winningAuthenticatorResult = authnResult;
        // Update authenticators
        // TODO save authenticators
        // userInfo.authenticators[parseInt(authrIdx, 10)].counter = authnResult.authnrData.get("counter");
        break;
      } catch (_e) {
        console.error(_e);
      }
    }
    console.log("login end, db user: ", aUser);
    if (winningAuthenticatorResult && aUser.registered) {
      // authentication complete!
      const result = HtmlUtils.respJson({ "status": "ok" });
      return result;
    } else {
      // Authentication failed
      return new Response("Authentication failed", { status: 403 });
    }
  };

  static handleAttestion = async (req: Request) => {
    const postBody = await req.json();
    const sessMgr = new SessMgr();
    const isCookieSecure = CookieUtils.isSecure(req.url);
    const cookieName = CookieUtils.getCookieName(
      SOPT.CHALLENGE.cookieName,
      isCookieSecure,
    );
    const { sessionId, sessionPayload: payloadRaw } = await sessMgr
      .getSessionFromRequestCookie<ChallengeSession>(
        req,
        cookieName,
        SOPT.CHALLENGE.sessionPrefix,
      );

    const challengeSession = Schema.ChallengeSession.parse(payloadRaw);
    
    const sessDbKey = [SOPT.CHALLENGE.sessionPrefix, sessionId];
    const username = challengeSession?.username;
    const challenge = challengeSession?.challenge;
    let resp = HtmlUtils.RESPNONE;
    if (username && challenge) {
      const userInfo = await UserUtils.getUserByName(username);
      // 可以辨識註冊還是登入要看是否有不同屬性
      if (userInfo && postBody.response.attestationObject !== undefined) {
        console.log(userInfo);
        // register attestation
        resp = await Handlers.handleRegisterAttestation(
          postBody,
          challenge,
          userInfo,
        );
        sessMgr.deleteSessionAndCookie(resp, cookieName, sessDbKey);
      } else if (
        userInfo && postBody.response.authenticatorData !== undefined
      ) {
        // login attestation
        resp = await Handlers.handleLoginAttestation(
          postBody,
          challenge,
          userInfo,
        );
        sessMgr.deleteSessionAndCookie(resp, cookieName, sessDbKey);
        if (resp.status == 200) {
          await SessionUtils.newMemberSession(
            SessMgr.RandomId(),
            userInfo.userName,
            req,
            resp,
          );
        }
      }
    }
    return resp;
  };
}

const handlerApp = async (req: Request) => {
  const aurl = new URL(req.url);
  let result = HtmlUtils.RESPNONE;
  console.log(aurl);

  if (req.method == "GET") {
    if (aurl.pathname == "/") {
      result = new Response(HTML_ROOT, {
        status: 200,
        headers: {
          // ...securityHeader,
          "content-type": "text/html; charset=utf-8",
        },
      });
    }
  }

  if (req.method == "POST") {
    switch (aurl.pathname) {
      case "/webauthn/register":
        result = await Handlers.handleRegister(req);
        break;
      case "/webauthn/authn":
        result = await Handlers.handleLogin(req);
        break;
      case "/webauthn/attestation":
        result = await Handlers.handleAttestion(req);
        break;
      default:
        break;
    }
  }
  return result;
};

const denoServeOpt: Deno.ServeOptions = { port: 3000, hostname: "localhost" };

Deno.serve(denoServeOpt, handlerApp);
