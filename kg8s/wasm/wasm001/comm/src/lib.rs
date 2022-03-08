pub mod schema;
pub mod hpke;

pub mod hpkeproto;
pub mod addrbook;
// Include the `items` module, which is generated from items.proto.
//pub mod tutorial {
//    include!(concat!(env!("OUT_DIR"), "/addrbook.rs"));
//}

pub fn json_to_yaml(target: &str) -> String {
    // Operating on untyped JSON values
    let sj = serde_json::from_str::<serde_json::Value>(target).unwrap();
    serde_yaml::to_string(&sj).unwrap()
}

pub fn get_csf_yaml() -> String {
    let my_str = include_str!("nist-csf-v1.1.json");
    json_to_yaml(my_str)
}

#[cfg(test)]
mod tests {
    use prost::Message;

    #[test]
    fn prost_encode() {        
        let alice_phone_number = super::addrbook::person::PhoneNumber {
            number: "987777".into(),
            r#type: super::addrbook::person::PhoneType::Mobile.into(),
        };

        let abook = super::addrbook::Person{
            name: "alice".into(),
            id: 1,
            email: "foo@dev.local".into(),
            phones: vec![alice_phone_number],
        };

        let encode_vec = abook.encode_to_vec();
        assert_eq!(encode_vec.len(), 34);
    }
}
