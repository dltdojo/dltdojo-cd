use fake::Fake;
use serde::{Serialize, Deserialize};

pub fn ethaddr() -> (String, String, String, String) {
    use bip39::{Language, Mnemonic, MnemonicType, Seed};
    use ethsign::SecretKey;
    use tiny_hderive::bip32::ExtendedPrivKey;
    let mnemonic = Mnemonic::new(MnemonicType::Words12, Language::ChineseTraditional);
    let seed = Seed::new(&mnemonic, "");
    let epriv = ExtendedPrivKey::derive(seed.as_bytes(), "m/44'/60'/0'/0/0").unwrap();
    let seckey = SecretKey::from_raw(&epriv.secret()).unwrap();
    let public = seckey.public();
    let eth_privatekey = hex::encode(epriv.secret());
    let eth_publickey = hex::encode(public.bytes());
    let eth_address = format!("0x{}", hex::encode(public.address()));
    (eth_privatekey, eth_publickey, eth_address, mnemonic.phrase().to_string())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Hodler {
    username: String,
    password: String,
    privatekey: String,
    publickey: String,
    ethaddr: String,
    mnemonic: String,
    name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, Copy)]
pub struct RpcFaker {
    pub show_key: bool,
    pub number: u16,
}

pub fn fake_users(req: RpcFaker) -> Vec<Hodler> {
    use fake::faker::internet::raw::*;
    use fake::faker::name::raw::*;
    use fake::locales::*;
    let v: Vec<Hodler> = (0.. req.number)
        .map(|_| {
            let (privatekey, publickey, ethaddr, mnemonic) = ethaddr();
            Hodler {
                username: Username(EN).fake(),
                password: Password(EN, 8..20).fake(),
                name: Name(ZH_TW).fake(),
                privatekey,
                publickey,
                ethaddr,
                mnemonic,
            }
        })
        .collect();
    v
}


pub fn add_two(x: i32) -> i32 {
    x + 2
}

#[cfg(test)]
mod tests {
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
    }
}
