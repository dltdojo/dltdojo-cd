import { Fido2Lib } from "https://deno.land/x/fido2@3.3.4/dist/main.js";
import express from 'npm:express@4.18.2';
import { base64 } from "https://deno.land/x/b64@1.1.25/src/base64.js";

const db = new Map<string, { id: Uint8Array, publickey: string }>();
const challengeData = new Map<string,string>();

const app = express();
app.use(express.json({ type: 'json' }));

const HTML = `
<!DOCTYPE html>
<html>
<head><title>WebAuthn Registration 2023</title></head>
<body><h1>FIDO2/WebAuthn</h1></body>
</html>
`
app.get('/', function (req, res) {
    res.send(HTML);
});

const ORIGIN = Deno.env.get("ORIGIN") || "http://localhost:3000";
const RPID = Deno.env.get("RPID") || "localhost";
const RPNAME = 'test-auth-server';

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

app.post('/webauthn/register', async (req, res) => {
    const id = randomBase64URLBuffer(32);
    const username: string = req.body.username;
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
    return res.status(200).json(registrationOptions);
});

app.post('/webauthn/attestation', async (req, res) => {
    const requstBody = req.body;
    console.log("req /webauthn/attestation")
    console.log(requstBody);
    let username = requstBody.username;
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
        return res.json({ "status": "ok" });
    }
});

console.log("service link http://localhost:3000")
app.listen(3000, '0.0.0.0')
