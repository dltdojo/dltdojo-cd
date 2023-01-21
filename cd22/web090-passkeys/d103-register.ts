import { Fido2Lib } from "https://deno.land/x/fido2@3.3.4/dist/main.js";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { base64 } from "https://deno.land/x/b64@1.1.25/src/base64.js";

const ORIGIN = Deno.env.get("ORIGIN") || "http://localhost:3000";
const RPID = Deno.env.get("RPID") || "localhost";
const RPNAME = 'test-auth-server';

const db = new Map<string, { id: Uint8Array, publickey: string }>();
const challengeData = new Map<string,string>();

const HTML = `
<!DOCTYPE html>
<html>
<head>
    <title>WebAuthn Registration 2023</title>
</head>
<body>
<h1>FIDO2/WebAuthn</h1>
<div>
<h2>Enter username</h2>
  <input type="text" id="username" maxlength="25">
  <button id="button-register" onclick="clickRegister()">Register</button>
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
    console.log("navCredCreateResp");
    console.log(navCredCreateResp)
    makeCredResponse = {
        id: navCredCreateResp.id,
        rawId: base64.fromArrayBuffer(navCredCreateResp.rawId,true),
        transports: navCredCreateResp.response.getTransports ? navCredCreateResp.response.getTransports() : undefined,
        response: {
            attestationObject: base64.fromArrayBuffer(navCredCreateResp.response.attestationObject,true),
            clientDataJSON: base64.fromArrayBuffer(navCredCreateResp.response.clientDataJSON,true)
        },
        type: navCredCreateResp.type,
        username
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


const router = new Router();
router.get("/", (ctx) => {
  ctx.response.body = HTML;
});

router.post("/webauthn/register", async (ctx) => {
    const requstBody = await ctx.request.body().value;
    console.log("req /webauthn/register")
    console.log(requstBody);
    const username = requstBody.username;
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
    challengeData.set(username, registrationOptions.challenge);
    console.log("challengeData:");
    console.log(challengeData);
    ctx.response.body = registrationOptions;
});

router.post("/webauthn/attestation", async (ctx) => {
    const requstBody = await ctx.request.body().value;
    console.log("req /webauthn/attestation")
    console.log(requstBody);
    const username = requstBody.username;
    if (requstBody.response.attestationObject !== undefined) {
        console.log("create cred");
        requstBody.rawId = base64.toArrayBuffer(requstBody.rawId, true);
        requstBody.response.attestationObject = base64.toArrayBuffer(
            requstBody.response.attestationObject,
            true,
        );
        const challenge = challengeData.get(username);
        console.log("webauthn-register-challenge:", challenge);
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
        db.set(username, {
            id: new Uint8Array(attResult.authnrData.get('credId')),
            publickey: attResult.authnrData.get('credentialPublicKeyPem'),
        });
        ctx.response.body = { "status": "ok" };
    }
});

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener(
  "listen",
  (e) => console.log("Listening on http://localhost:3000"),
);
await app.listen({ port: 3000 });
