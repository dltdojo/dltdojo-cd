use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn run() {
    log("\r\nwasm_bindgen(start): invoke console.log to print this message.\r\n");
}

#[wasm_bindgen]
extern {
    // Use `js_namespace` here to bind `console.log(..)` instead of just `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    log(&format!("Hello 5, {}!", name));
}

#[wasm_bindgen(js_name = getCsfYaml)]
pub fn get_csf_yaml()  -> String  {
   comm::get_csf_yaml()
}

#[wasm_bindgen(js_name = hpkeKeyGen)]
pub fn hpke_key_gen(randomness: &[u8]) -> Vec<u8> {
   let keypair = comm::hpke::hpke_keygen_dhkem_x25519_hkdf_sha256(randomness);
   comm::hpke::keypair_to_vec(keypair)
}

//
// To simplify the wasm export/import problem. this is not recommended.
// import init, { Foo } from '../../jsbind/pkg/jsbind.js';
// 
#[wasm_bindgen]
pub struct Foo {
    contents: u32,
}

//
// To simplify the wasm export/import problem. this is not recommended.
//
#[wasm_bindgen]
impl Foo {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Foo {
        Foo { contents: 0 }
    }

    #[wasm_bindgen(js_name = getContents)]
    pub fn get_contents(&self) -> u32 {
        self.contents
    }

    //
    // import init, { Foo } from '../../jsbind/pkg/jsbind.js';
    // let x = new Foo().getCsfYaml();
    // 
    #[wasm_bindgen(js_name = getCsfYaml)]
    pub fn get_csf_yaml(&self)  -> String  {
        comm::get_csf_yaml()
     }
}


#[cfg(test)]
mod tests {

    #[test]
    fn it_works() {
        let y = super::get_csf_yaml();
        assert!(!y.is_empty());
    }
}
