#[derive(Clone, PartialEq, ::prost::Message)]
pub struct Config {
    #[prost(enumeration="config::Kem", tag="1")]
    pub kem: i32,
    #[prost(enumeration="config::Kdf", tag="2")]
    pub kdf: i32,
    #[prost(enumeration="config::Aead", tag="3")]
    pub aead: i32,
}
/// Nested message and enum types in `Config`.
pub mod config {
    /// <https://www.rfc-editor.org/rfc/rfc9180.html#name-key-encapsulation-mechanism>
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
    #[repr(i32)]
    pub enum Kem {
        Reserved = 0,
        DhkemP256HkdfSha256 = 16,
        DhkemP384HkdfSha384 = 17,
        DhkemP521HkdfSha512 = 18,
        DhkemX25519HkdfSha256 = 32,
        DhkemX25519HkdfSha512 = 33,
    }
    /// <https://www.rfc-editor.org/rfc/rfc9180.html#name-key-derivation-functions-kd>
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
    #[repr(i32)]
    pub enum Kdf {
        Reserved = 0,
        HkdfSha256 = 1,
        HkdfSha384 = 2,
        HkdfSha512 = 3,
    }
    /// <https://www.rfc-editor.org/rfc/rfc9180.html#name-authenticated-encryption-wi>
    #[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord, ::prost::Enumeration)]
    #[repr(i32)]
    pub enum Aead {
        Reserved = 0,
        Aes128Gcm = 1,
        Aes256Gcm = 2,
        /// EXPORT_ONLY = 0xFFFF;
        AesChaCha20Poly1305 = 3,
    }
}
#[derive(Clone, PartialEq, ::prost::Message)]
pub struct KeyPair {
    #[prost(enumeration="config::Kem", tag="1")]
    pub kem_id: i32,
    #[prost(bytes="vec", tag="2")]
    pub private_key: ::prost::alloc::vec::Vec<u8>,
    #[prost(bytes="vec", tag="3")]
    pub public_key: ::prost::alloc::vec::Vec<u8>,
}
