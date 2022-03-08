use hacspec_lib::ByteSeq;
use hpke_aead::AEAD;
use hpke_kdf::KDF;
use hpke_kem::{GenerateKeyPair, KeyPair, KEM};
use prost::Message;

pub fn keypair_to_vec(keypair: KeyPair) -> Vec<u8> {
    let mut out = keypair.0.into_native();
    out.append(&mut keypair.1.into_native());
    out
}

pub fn keypair_to_proto(keypair: KeyPair) -> crate::hpkeproto::KeyPair {
    let kem_id = crate::hpkeproto::config::Kem::DhkemX25519HkdfSha256.into();
    let out = crate::hpkeproto::KeyPair{
        kem_id,
        private_key: keypair.0.into_native(),
        public_key: keypair.1.into_native(),
    };
    out
}

pub fn keypair_to_proto_vec(keypair: KeyPair) -> Vec<u8> {
    let out = keypair_to_proto(keypair);
    out.encode_to_vec()
}


pub fn seal_result_to_vec(result: hpke::HPKECiphertext) -> Vec<u8> {
    let mut out = result.0.into_native();
    out.append(&mut result.1.into_native());
    out
}

//
// https://github.com/cryspen/hpke-spec/blob/67ce7ec45dd129377eabc2b56e8bdb637fdbada5/hpke/src/hpke.rs#L1003
// It generates x25519 keys sk||pk.
//
pub fn hpke_keygen_dhkem_x25519_hkdf_sha256(randomness: &[u8]) -> KeyPair {
    GenerateKeyPair(
        KEM::DHKEM_X25519_HKDF_SHA256,
        ByteSeq::from_public_slice(randomness),
    )
    .unwrap()
}

// https://github.com/cryspen/hpke-spec/blob/67ce7ec45dd129377eabc2b56e8bdb637fdbada5/hpke/src/hpke.rs#L1014
// https://www.rfc-editor.org/rfc/rfc9180.html#name-key-encapsulation-mechanism
// Nenc = 32 bytes
// pk_r: public key of recipient
// info: Application-supplied information (optional; default value "").
//
// js code
// let result = hpke_seal_base(pkR, info, aad, pt, rand);
// let enc = new Uint8Array(result.slice(0, 32));
// let ct = new Uint8Array(result.slice(32));
pub fn hpke_seal_base_x25519_hkdf_sha256_chacha20poly1305(
    kem_pk_r: &[u8],
    kem_app_supplied_info: &[u8],
    aead_associated_data: &[u8],
    aead_plaintext: &[u8],
    randomness: &[u8],
) -> hpke::HPKECiphertext {
    let config = get_config();
    // base mode
    let psk = None;
    let psk_id = None;
    let sk_s = None;
    hpke::HpkeSeal(
        config,
        &ByteSeq::from_public_slice(kem_pk_r),
        &ByteSeq::from_public_slice(kem_app_supplied_info),
        &ByteSeq::from_public_slice(aead_associated_data),
        &ByteSeq::from_public_slice(aead_plaintext),
        psk,
        psk_id,
        sk_s,
        ByteSeq::from_public_slice(randomness),
    )
    .unwrap()
}

pub fn get_config()-> hpke::HPKEConfig{
    hpke::HPKEConfig(
        hpke::Mode::mode_base,
        KEM::DHKEM_X25519_HKDF_SHA256,
        KDF::HKDF_SHA256,
        AEAD::ChaCha20Poly1305,
    )
}

pub fn hpke_open_base_x25519_hkdf_sha256_chacha20poly1305(
    kem_sk_r: &[u8],
    kem_enc: &[u8],
    aead_cryptotext: &[u8],
    kem_app_supplied_info: &[u8],
    aead_associated_data: &[u8],
) -> ByteSeq {
    let config = get_config();

    let ct = hpke::HPKECiphertext(
        ByteSeq::from_public_slice(kem_enc),
        ByteSeq::from_public_slice(aead_cryptotext),
    );

    // base mode
    let psk = None;
    let psk_id = None;
    let pk_s = None;
    hpke::HpkeOpen(
        config,
        &ct,
        &ByteSeq::from_public_slice(kem_sk_r),
        &ByteSeq::from_public_slice(kem_app_supplied_info),
        &ByteSeq::from_public_slice(aead_associated_data),
        psk,
        psk_id,
        pk_s,
    )
    .unwrap()
}

#[cfg(test)]
mod tests {
    // wasm demo
    // https://github.com/cryspen/hpke-spec/blob/67ce7ec45dd129377eabc2b56e8bdb637fdbada5/hpke/wasm_demo/index.html#L80
    // let rand = new Uint8Array(32);
    // window.crypto.getRandomValues(rand);
    // const receiver_sk_pk = hpke_key_gen(rand);
    // let skR = receiver_sk_pk.slice(0, 32);
    // let pkR = receiver_sk_pk.slice(32);
    // document.receiver_form.pkR.value = bytes_to_hex(pkR);
    // document.receiver_form.skR.value = bytes_to_hex(skR);

    #[test]
    fn key_gen() {
        use rand::{rngs::OsRng, RngCore};
        let mut randomness = [0u8; 32];
        OsRng.fill_bytes(&mut randomness);
        let (sk, pk) = super::hpke_keygen_dhkem_x25519_hkdf_sha256(&randomness);
        // generates x25519 keys sk||pk.
        assert_eq!(32, sk.len());
        assert_eq!(32, pk.len());
        let x = super::keypair_to_vec((sk, pk));
        assert_eq!(64, x.len());
    }

    // TODO Test
    // https://github.com/cryspen/hpke-spec/blob/67ce7ec45dd129377eabc2b56e8bdb637fdbada5/hpke/tests/single_kat.rs#L8
    // info: Ode on a Grecian Urn 4f6465206f6e2061204772656369616e2055726e
}
