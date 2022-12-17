import { Fido2Lib } from "https://deno.land/x/fido2@3.3.4/dist/main.js";
import { Application, Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { base64 } from "https://deno.land/x/b64@1.1.25/src/base64.js";
import { Session } from "https://deno.land/x/oak_sessions@v4.0.6/mod.ts";

const ORIGIN = Deno.env.get("ORIGIN") || "http://localhost:3000";
const RPID = Deno.env.get("RPID") || "localhost";
const RPNAME = 'test-auth-server';

// https://github.com/Hexagon/webauthn-skeleton/blob/714a1ffdcde11ac33d816dfa934ab5d5ce93a1e6/utils/token.ts#L4
interface IToken {
    username: string;
    token: ArrayBuffer;
    expires: number;
}
// https://github.com/Hexagon/webauthn-skeleton/blob/714a1ffdcde11ac33d816dfa934ab5d5ce93a1e6/db/db.ts#L4
interface IAuthenticator {
    credId: string,
    publicKey: string,
    type: string,
    transports: string[],
    counter: number,
    created: Date,
}

interface IUser {
    userName?: string;
    name?: string;
    registered?: boolean;
    id?: string;
    authenticators?: IAuthenticator[];
    oneTimeToken?: IToken;
    recoveryEmail?: string;
}

const db123: IUser[] = [];

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
	/* ----- DO NOT MODIFY THIS CODE ----- */
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
`

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

const randomBase64URLBuffer = (len: number) => {
    len = len || 32;
    const randomBytes = new Uint8Array(len);
    crypto.getRandomValues(randomBytes);
    return base64.fromArrayBuffer(randomBytes, true);
};

type AppState = {
    session: Session
}

const app = new Application<AppState>();
const router = new Router<AppState>();

app.use(Session.initMiddleware())



router.get("/", (ctx) => {
    ctx.response.body = HTML;
});

router.post("/webauthn/register", async (ctx) => {
    const requstBody = await ctx.request.body().value;
    console.log("req /webauthn/register")
    console.log(requstBody);
    const username = requstBody.username;
    console.log(ctx.state);
    const id = randomBase64URLBuffer(32);
    const registrationOptionsRaw = await f2l.attestationOptions();
    const registrationOptions = {
        ...registrationOptionsRaw,
        user: {
            id,
            name: username,
            displayName: username,
        },
        challenge: base64.fromArrayBuffer(registrationOptionsRaw.challenge, true),
    };
    console.log("reg opt: ", registrationOptions);
    
    const userInfo: IUser = db123.find(entry => entry.userName == username);
    if (userInfo && userInfo.registered) {
        ctx.response.body = { message: `Username ${username} already exists` };
        ctx.response.status = 500;
    } else {
        db123.push({
            userName: username,
            name: username,
            registered: false,
            id,
            authenticators: [],
            oneTimeToken: undefined,
            recoveryEmail: undefined
        });
        // Transfer challenge and username to session
        await ctx.state.session.set("challenge", registrationOptions.challenge);
        await ctx.state.session.set("username", username);
        ctx.response.body = registrationOptions;
    }
});

router.post("/webauthn/attestation", async (ctx) => {
    const requstBody = await ctx.request.body().value;
    console.log("req /webauthn/attestation")
    console.log(requstBody);
    const username = await ctx.state.session.get("username");
    const challenge = await ctx.state.session.get("challenge");
    const userInfo: IUser = db123.find(entry => entry.userName == username);
    console.log(userInfo);
    if (userInfo && requstBody.response.attestationObject !== undefined) {
        console.log("Register: create a new cred");
        requstBody.rawId = base64.toArrayBuffer(requstBody.rawId, true);
        requstBody.response.attestationObject = base64.toArrayBuffer(
            requstBody.response.attestationObject,
            true,
        );
        const attestationExpectations = {
            challenge,
            origin: ORIGIN,
            factor: "either",
        };
        const clientAttestationResponse = requstBody;
        const attResult = await f2l.attestationResult(
            clientAttestationResponse,
            attestationExpectations,
        ); // will throw on error

        console.log(attResult);
        const credId = base64.fromArrayBuffer(attResult.authnrData.get("credId"), true);
        const counter = attResult.authnrData.get("counter");

        const token: IAuthenticator = {
            credId,
            publicKey: attResult.authnrData.get('credentialPublicKeyPem'),
            type: requstBody.type,
            transports: requstBody.transports,
            counter: attResult.authnrData.get("counter"),
            created: new Date(),
        };
        const newAuthenticators = userInfo.authenticators ? [...userInfo.authenticators] : [];
        newAuthenticators.push(token);
        userInfo.authenticators = newAuthenticators;
        userInfo.registered = true;
        console.log("register end, db user: ", userInfo);
        await ctx.state.session.set("loggedIn", true);
        ctx.response.body = { "status": "ok" };
    } else if (userInfo && requstBody.response.authenticatorData !== undefined) {
        // login attestation
        console.log("Login/authn: check autnenticatiorData");
        requstBody.rawId = base64.toArrayBuffer(requstBody.rawId, true);
        requstBody.response.userHandle = requstBody.rawId;
        const allowCredentials = await ctx.state.session.get("allowCredentials");
        let winningAuthenticatorResult;            
		for(const authrIdx in userInfo.authenticators) {
			const authr = userInfo.authenticators[parseInt(authrIdx, 10)];
			try {
				const assertionExpectations = {
					allowCredentials,
					challenge,
					origin: ORIGIN,
					factor: "either",
					publicKey: authr.publicKey,
					prevCounter: authr.counter,
					userHandle: authr.credId
				};
                const authnResult = await f2l.assertionResult(requstBody, assertionExpectations);
				winningAuthenticatorResult = authnResult;
				// Update authenticators
				userInfo.authenticators[parseInt(authrIdx, 10)].counter = authnResult.authnrData.get("counter");
				break;
			} catch (_e) {
				console.error(_e);
			}
		}
        console.log("login end, db user: ", userInfo)
		if (winningAuthenticatorResult && userInfo.registered) {
            // authentication complete!
			await ctx.state.session.set("loggedIn", true);
			ctx.response.body = { "status": "ok" };
		} else {
			// Authentication failed
            ctx.response.body = { message: 'Authentication failed' };
            ctx.response.status = 403;
		}
    }
});

router.post("/webauthn/authn", async (ctx) => {
    const requstBody = await ctx.request.body().value;
    console.log(requstBody);
    const username = requstBody.username;
    console.log(db123);
    const userInfo: IUser = db123.find(entry => entry.userName == username);
    if (userInfo === undefined) {
        ctx.response.body = { message: `Username ${username} not found` };
        ctx.response.status = 500;
    }
    const authnOptionsRaw = await f2l.assertionOptions();
    const authnOptions = {
        ...authnOptionsRaw,
        challenge: base64.fromArrayBuffer(authnOptionsRaw.challenge, true)
    };

    // Transfer challenge and username to session
	await ctx.state.session.set("challenge", authnOptions.challenge);
	await ctx.state.session.set("username", username);

    // Pass this, to limit selectable credentials for user... This may be set in response instead, so that
	// all of a users server (public) credentials isn't exposed to anyone
	const allowCredentials = [];
	for(const authr of userInfo.authenticators) {
		allowCredentials.push({
			type: authr.type,
			id: authr.credId,
			transports: authr.transports
		});
	}

	authnOptions.allowCredentials = allowCredentials;
    await ctx.state.session.set("allowCredentials", allowCredentials);
    ctx.response.body = authnOptions;
});

app.addEventListener('error', (e) => console.log(e.error));
app.addEventListener("listen", (e) => console.log("Listening on http://localhost:3000"));

app.use(router.routes());
app.use(router.allowedMethods());
await app.listen({ port: 3000 });
