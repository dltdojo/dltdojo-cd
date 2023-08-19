// 
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


const ORIGIN = Deno.env.get("ORIGIN") || "http://localhost:3000";
const RPID = Deno.env.get("RPID") || "localhost";
const RPNAME = "test-auth-server";

// https://github.com/Hexagon/webauthn-skeleton/blob/714a1ffdcde11ac33d816dfa934ab5d5ce93a1e6/utils/token.ts#L4
interface IToken {
    username: string;
    token: ArrayBuffer;
    expires: number;
}
// https://github.com/Hexagon/webauthn-skeleton/blob/714a1ffdcde11ac33d816dfa934ab5d5ce93a1e6/db/db.ts#L4
interface IAuthenticator {
    credId: string;
    publicKey: string;
    type: string;
    transports: string[];
    counter: number;
    created: Date;
}

interface IUser {
    userName: string;
    name?: string;
    registered?: boolean;
    challengeId: string;
    authenticators: IAuthenticator[];
    oneTimeToken?: IToken;
    recoveryEmail?: string;
}

const db = await Deno.openKv();

const HTML = `
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
import { base64 } from "https://deno.land/x/b64@1.1.25/src/base64.js";
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
	/* ----- DO NOT MODIFY THIS CODE --export {
        type Cookie,
        deleteCookie,
        getCookies,
        getSetCookies,
        setCookie,
      } from "https://deno.land/std@0.198.0/http/cookie.ts";--- */
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

const f2l = new Fido2Lib({
    timeout: 60000,
    rpId: RPID,
    rpName: RPNAME,
    challengeSize: 128,
    attestation: "direct",
    cryptoParams: [-7, -257],
    authenticatorAttachment: undefined, // ["platform", "cross-platform"]
    authenticatorRequireResidentKey: false,
    authenticatorUserVerification: "preferred",
});

const respJson = (bodyObj: any, status = 200) => {
    return new Response(JSON.stringify(bodyObj), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
        },
    });
};

const getUserByName = async (username: string): Promise<IUser> => {
    const key = ["user", username];
    return (await db.get<IUser>(key)).value!;
}
const upsertUser = async (user: IUser) => {
    const userKey = ["user", user.userName];
    //const oldUser = await db.get<IUser>(userKey);
    const ok = await db.set(userKey, user);
    if (!ok) throw new Error("Something went wrong.");
}

// session
// deno_kv_oauth/src/core.ts at main · denoland/deno_kv_oauth
// https://github.com/denoland/deno_kv_oauth/blob/main/src/core.ts

const CHALLENGE_SESSION_PREFIX = "register_sessions";

interface ChallengeSession {
    challenge: string;
    username: string;
}

const getChallengeSession = async (challengeSessionId: string) => {
    const result = await db.get<ChallengeSession>([
        CHALLENGE_SESSION_PREFIX,
        challengeSessionId,
    ]);
    return result.value;
}

const setChallengeSession = async (
    challengeSessionId: string,
    challengeSession: ChallengeSession,
) => {
    await db.set([CHALLENGE_SESSION_PREFIX, challengeSessionId], challengeSession);
}

const deleteChallengeSession = async (challengeSessionId: string) => {
    await db.delete([CHALLENGE_SESSION_PREFIX, challengeSessionId]);
}

/** @see https://github.com/denoland/deno_kv_oauth/blob/6113e35885587eaeab34826b7fb728426efd152e/src/core.ts#L17C1-L24C74 */

const CHALLENGE_COOKIE_NAME = "challenge-session";
const SITE_COOKIE_NAME = "site-session";

// Determines whether the request URL is of a secure origin using the HTTPS protocol.
const isSecure = (requestUrl: string) => new URL(requestUrl).protocol === "https:";

// Dynamically prefixes the cookie name, depending on whether it's for a secure origin (HTTPS).
const getCookieName = (name: string, isSecure: boolean) => isSecure ? "__Host-" + name : name;

const COOKIE_BASE = {
    path: "/",
    httpOnly: true,
    // 90 days
    maxAge: 7776000,
    sameSite: "Lax",
} as Required<Pick<Cookie, "path" | "httpOnly" | "maxAge" | "sameSite">>;


const RESPNONE = new Response("none");

const getAllowCredentialsFromUserAuthenticators = (authenticators: IAuthenticator[]) => {
    const allowCredentials = [];
    for (const authr of authenticators) {
        allowCredentials.push({
            type: authr.type,
            id: authr.credId,
            transports: authr.transports,
        });
    }
    return allowCredentials
}

const handleLogin = async (req: Request) => {
    const postBody = await req.json();
    const username = postBody.username;
    const userInfo: IUser = await getUserByName(username)

    if (userInfo === undefined) {
        return new Response(`Username ${username} not found`, { status: 500 })
    } else {
        const authnOptionsRaw = await f2l.assertionOptions();
        const authnOptions = {
            ...authnOptionsRaw,
            challenge: encodeBase64Url(authnOptionsRaw.challenge),
        };

        const challengeId = crypto.randomUUID();
        await setChallengeSession(challengeId, {
            challenge: authnOptions.challenge,
            username
        })
        // Pass this, to limit selectable credentials for user... This may be set in response instead, so that
        // all of a users server (public) credentials isn't exposed to anyone
        authnOptions.allowCredentials = getAllowCredentialsFromUserAuthenticators(userInfo.authenticators);
        const response = respJson(authnOptions);
        setChallengeSessionIdToResponseCookie(response, challengeId, isSecure(req.url))
        return response;
    }
}
const handleRegister = async (req: Request) => {
    const postBody = await req.json();
    const username = postBody.username;
    const userInfo = await getUserByName(username);
    if (userInfo && userInfo.registered) {
        return new Response(`Username ${username} already exists`, { status: 500 });
    }

    const registrationOptionsRaw = await f2l.attestationOptions();
    const challengeId = crypto.randomUUID();
    const registrationOptions = {
        ...registrationOptionsRaw,
        user: {
            id: challengeId,
            name: username,
            displayName: username,
        },
        challenge: encodeBase64Url(registrationOptionsRaw.challenge),
    };
    console.log("reg opt: ", registrationOptions);

    const user: IUser = {
        userName: username,
        name: username,
        registered: false,
        challengeId: challengeId,
        authenticators: [],
        oneTimeToken: undefined,
        recoveryEmail: undefined,
    }

    // 新增使用者註冊
    await upsertUser(user)
    // ref https://github.com/denoland/deno_kv_oauth/blob/6113e35885587eaeab34826b7fb728426efd152e/src/sign_in.ts#L55
    // 新增註冊會期
    await setChallengeSession(challengeId, {
        challenge: registrationOptions.challenge,
        username
    })
    // 會期綁定
    const response = respJson(registrationOptions)
    setChallengeSessionIdToResponseCookie(response, challengeId, isSecure(req.url))
    return response;
};

const handleRegisterAttestation = async (postBody: any, challenge: string, userInfo: IUser) => {
    let result = RESPNONE
    postBody.rawId = decodeBase64Url(postBody.rawId).buffer;
    postBody.response.attestationObject = decodeBase64Url(postBody.response.attestationObject).buffer;
    const clientAttestationResponse = postBody;
    console.log(clientAttestationResponse)
    const attestationExpectations = {
        challenge,
        origin: ORIGIN,
        factor: "either",
    };
    const attResult = await f2l.attestationResult(
        clientAttestationResponse,
        attestationExpectations,
    );

    console.log(attResult)

    if (attResult && attResult.authnrData) {
        const credId = encodeBase64Url(attResult.authnrData.get("credId"));
        const counter = attResult.authnrData.get("counter");

        const token: IAuthenticator = {
            credId,
            publicKey: attResult.authnrData.get("credentialPublicKeyPem"),
            type: postBody.type,
            transports: postBody.transports,
            counter,
            created: new Date(),
        };
        const newAuthenticators = userInfo.authenticators
            ? [...userInfo.authenticators]
            : [];
        newAuthenticators.push(token);
        userInfo.authenticators = newAuthenticators;
        userInfo.registered = true;
        console.log("register end, db user: ", userInfo);
        await upsertUser(userInfo)
        result = respJson({ "attestation": "ok" });
    }
    return result
}

const handleLoginAttestation = async (postBody: any, challenge: string, userInfo: IUser) => {
    postBody.rawId = decodeBase64Url(postBody.rawId).buffer;
    const allowCredentials = getAllowCredentialsFromUserAuthenticators(userInfo.authenticators);
    let winningAuthenticatorResult;
    for (const authrIdx in userInfo.authenticators) {
      const authr = userInfo.authenticators[parseInt(authrIdx, 10)];
      try {
        const assertionExpectations = {
          allowCredentials,
          challenge,
          origin: ORIGIN,
          factor: "either",
          publicKey: authr.publicKey,
          prevCounter: authr.counter,
          userHandle: authr.credId,
        };
        const authnResult = await f2l.assertionResult(
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
    console.log("login end, db user: ", userInfo);
    if (winningAuthenticatorResult && userInfo.registered) {
      // authentication complete!
      // TODO
      // await ctx.state.session.set("loggedIn", true);
      return respJson({ "status": "ok" });
    } else {
      // Authentication failed
      return new Response("Authentication failed", {status: 403})
    }
}

const getChallengeSessionFromRequestCookie = async (req: Request) => {
    const challengeCookieName = getCookieName(
        CHALLENGE_COOKIE_NAME,
        isSecure(req.url),
    );
    const challengeSessionId = getCookies(req.headers)[challengeCookieName];
    const challengeSession: ChallengeSession | null = await getChallengeSession(challengeSessionId);
    return challengeSession;
}

const setChallengeSessionIdToResponseCookie = (response: Response, challengeId: string, isSecure: boolean) => {
    setCookie(response.headers, {
        ...COOKIE_BASE,
        name: getCookieName(CHALLENGE_COOKIE_NAME, isSecure),
        value: challengeId,
        secure: isSecure,
        maxAge: 10 * 60,
    });
}

const handlerApp = async (req: Request) => {
    const aurl = new URL(req.url);
    let result = RESPNONE;
    console.log(aurl);
    if (req.method == "GET") {
        if (aurl.pathname == "/") {
            result = new Response(HTML, {
                status: 200,
                headers: {
                    "content-type": "text/html; charset=utf-8",
                },
            });
        }
    } else if (req.method == "POST") {
        if (aurl.pathname == "/webauthn/register") {
            result = await handleRegister(req);
        } else if (aurl.pathname == "/webauthn/authn") {
            result = await handleLogin(req);
        } else if (aurl.pathname == "/webauthn/attestation") {
            const postBody = await req.json();
            const challengeSession = await getChallengeSessionFromRequestCookie(req)
            const username = challengeSession?.username;
            const challenge = challengeSession?.challenge;

            if (username && challenge) {
                const userInfo: IUser = await getUserByName(username)
                // 可以辨識註冊還是登入要看是否有不同屬性
                if (userInfo && postBody.response.attestationObject !== undefined) {
                    console.log(userInfo)
                    // register attestation
                    result = await handleRegisterAttestation(postBody, challenge, userInfo)
                } else if (userInfo && postBody.response.authenticatorData !== undefined) {
                    // login attestation
                    result = await handleLoginAttestation(postBody, challenge, userInfo)
                }
            }

        }
    }
    return result;
};

Deno.serve({ port: 3000, hostname: "localhost" }, handlerApp);


