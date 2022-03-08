//
// [Rust - Zellij User Guide](https://zellij.dev/documentation/plugin-rust.html)
// https://github.com/zellij-org/zellij/blob/a624cb3510b5023285c6050d3e3a9f983b5663d4/zellij-tile/src/shim.rs
//
use serde::{de::DeserializeOwned, Serialize, Deserialize};
use strum_macros::{EnumDiscriminants, EnumString, ToString};

#[derive(Debug, Clone, PartialEq, EnumDiscriminants, ToString, Serialize, Deserialize)]
#[strum_discriminants(derive(EnumString, Hash, Serialize, Deserialize))]
#[non_exhaustive]
pub enum EventType {
    SystemFailure,
    InputReceived,
    Visible(bool),
}

// [RFC 9180: Hybrid Public Key Encryption](https://www.rfc-editor.org/rfc/rfc9180.html#name-algorithm-identifiers)
// Key Encapsulation Mechanisms (KEMs) 0x0020 | DHKEM(X25519, HKDF-SHA256) [RFC7748], [RFC5869]
pub fn hpke_key_gen(randomness: &[u8]) -> Vec<u8> {
    let keypair = comm::hpke::hpke_keygen_dhkem_x25519_hkdf_sha256(randomness);
    comm::hpke::keypair_to_vec(keypair)
 }

 
// TODO: yaml or toml
pub fn object_from_stdin_json<T: DeserializeOwned>() -> Result<T, serde_json::Error> {
    let mut json = String::new();
    std::io::stdin().read_line(&mut json).unwrap();
    serde_json::from_str(&json)
}

//#[link(wasm_import_module = "zellij")]
// extern "C" {
//     fn host_subscribe();
//     fn host_unsubscribe();
//     fn host_set_selectable(selectable: i32);
//     fn host_get_plugin_ids();
//     fn host_get_zellij_version();
//     fn host_open_file();
//     fn host_switch_tab_to(tab_idx: u32);
//     fn host_set_timeout(secs: f64);
//     fn host_exec_cmd();
// }
