# CTAP

[Client to Authenticator Protocol (CTAP) Proposed Standard, January 30, 2019](https://fidoalliance.org/specs/fido-v2.0-ps-20190130/fido-client-to-authenticator-protocol-v2.0-ps-20190130.html)


## 5.5.2 Authenticator Configuration Operations Upon Power Up

- [5.5.2. Authenticator Configuration Operations Upon Power Up | Client to Authenticator Protocol (CTAP)](https://fidoalliance.org/specs/fido-v2.0-ps-20190130/fido-client-to-authenticator-protocol-v2.0-ps-20190130.html#authenticator-power-up-configuration)
- [Search · gensk](https://github.com/google/OpenSK/search?q=gensk)
- https://github.com/google/OpenSK/blob/5e682d9e176e936c22fcb963a708ffb0b47a33e6/src/ctap/pin_protocol_v1.rs#L184


```rs
// 5.5.2 Authenticator Configuration Operations Upon Power Up
// Generate "authenticatorKeyAgreementKey"
// Generate an ECDH P-256 key pair called "authenticatorKeyAgreementKey" 
// denoted by (a, aG) where "a" denotes the private key and "aG" denotes the public key.
let key_agreement_key = crypto::ecdh::SecKey::gensk(rng);
// Generate "pinToken"
// "pinToken" is used so that there is minimum burden on the authenticator and platform does not 
// have to not send actual encrypted PIN to the authenticator in normal authenticator usage 
// scenarios. This also provides more security as we are not sending actual PIN even in encrypted 
// form. "pinToken" will be given to the platform upon verification of the PIN to be used in 
// subsequent authenticatorMakeCredential and authenticatorGetAssertion operations.
let pin_uv_auth_token = rng.gen_uniform_u8x32();
```

## 5.5.4. Getting sharedSecret from Authenticator

- [5.5.4. Getting sharedSecret from Authenticator | Client to Authenticator Protocol (CTAP)](https://fidoalliance.org/specs/fido-v2.0-ps-20190130/fido-client-to-authenticator-protocol-v2.0-ps-20190130.html#gettingSharedSecret)
- https://github.com/google/OpenSK/blob/5e682d9e176e936c22fcb963a708ffb0b47a33e6/libraries/crypto/src/ecdh.rs#L67
- https://github.com/google/OpenSK/blob/5e682d9e176e936c22fcb963a708ffb0b47a33e6/libraries/crypto/src/ecdh.rs#L130

```rs
// Platform generates "sharedSecret" using SHA-256 over ECDH key agreement protocol using private 
// key of platformKeyAgreementKey, "b" and public key of authenticatorKeyAgreementKey, "aG": 
// SHA-256((baG).x).
#[test]
fn test_exchange_x_sha256_is_symmetric() {
  let mut rng = ThreadRng256 {};
        for _ in 0..ITERATIONS {
            let sk_a = SecKey::gensk(&mut rng);
            let pk_a = sk_a.genpk();
            let sk_b = SecKey::gensk(&mut rng);
            let pk_b = sk_b.genpk();
            assert_eq!(sk_a.exchange_x_sha256(&pk_b), sk_b.exchange_x_sha256(&pk_a));
        }
}
```