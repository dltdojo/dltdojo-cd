use wasm_bindgen::prelude::*;
use bip39::{Language, Mnemonic, Seed};
#[wasm_bindgen]
pub fn seed(phrase: &str) -> Box<[u8]> {
  let mnemonic = Mnemonic::from_phrase(phrase, Language::ChineseTraditional).unwrap();
  let seed = Seed::new(&mnemonic, "12345");
  let seed_bytes: &[u8] = seed.as_bytes();
  // print the HD wallet seed as a hex string
  // println!("{:X}", seed);
  seed_bytes.to_vec().into_boxed_slice()
}