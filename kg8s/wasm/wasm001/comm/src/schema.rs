use kube::CustomResourceExt;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

#[derive(kube::CustomResource, Debug, Serialize, Deserialize, Default, Clone, JsonSchema)]
#[kube(group = "clux.dev", version = "v1", kind = "Foo", namespaced)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct FooStruct {
    name: String,
    info: String,
    my_bool: bool,
    some_data: std::collections::HashMap<String, usize>,
}

pub fn eq_yaml(a: &str, b: &str) -> bool {
    let target_value: serde_yaml::Value = serde_yaml::from_str(a).unwrap();
    let result_value: serde_yaml::Value = serde_yaml::from_str(b).unwrap();
    target_value == result_value
}

pub fn eq_json(a: &str, b: &str) -> bool {
    let target_value: serde_json::Value = serde_json::from_str(a).unwrap();
    let result_value: serde_json::Value = serde_json::from_str(b).unwrap();
    target_value == result_value
}

pub fn schema_json_foo() -> String {
    let schema = schemars::schema_for!(FooStruct);
    serde_json::to_string_pretty(&schema).unwrap()
}

pub fn schema_crd_foo() -> String {
    let crd = Foo::crd();
    // println!("foo: {:?}", f);
    serde_yaml::to_string(&crd).unwrap()
}

pub fn schema_openapi_components_foo() -> String {
    let crd = Foo::crd();
    // https://docs.rs/k8s-openapi/latest/k8s_openapi/apiextensions_apiserver/pkg/apis/apiextensions/v1/struct.JSONSchemaProps.html
    // let openapi_schema_from_crd = crd.spec.versions[0].schema.as_ref().unwrap().open_api_v3_schema.as_ref().unwrap();
    let schema_openapi_crd =
        serde_yaml::to_value(crd.spec.versions[0].schema.as_ref().unwrap()).unwrap();
    //println!("{}", serde_yaml::to_string(&x["openAPIV3Schema"]["properties"]["spec"]).unwrap());

    let openapi_com_schemas = r#"
        components:
          schemas:
            Foo: {}
        "#;

    let mut target_foo = serde_yaml::from_str::<serde_yaml::Value>(openapi_com_schemas).unwrap();
    // println!("{}", serde_yaml::to_string(&target_foo)?);
    //let mut m = serde_yaml::Mapping::new();
    //m.insert("key".into(), "value".into());
    //target_foo["components"]["schemas"]["Foo"] = serde_yaml::to_value(openapi_schema_from_crd)?;
    target_foo["components"]["schemas"]["Foo"] =
        schema_openapi_crd["openAPIV3Schema"]["properties"]["spec"].clone();
    serde_yaml::to_string(&target_foo).unwrap()
}

#[cfg(test)]
mod tests {

    #[test]
    fn json_schema() {
        let result = super::schema_json_foo();
        println!("{}", result);
        assert!(result.contains("http://json-schema.org/draft-07/schema"));
        let target = include_str!("test-res/foo-json-schema.json");
        assert!(super::eq_json(result.as_str(), target))
    }

    #[test]
    fn crd_schema() {
        let result = super::schema_crd_foo();
        println!("{}", result);
        let target = include_str!("test-res/foo-crd.yaml");
        assert!(super::eq_yaml(result.as_str(), target))
    }
    
    #[test]
    fn openapi_components_schema() {
        let result = super::schema_openapi_components_foo();
        println!("{}", result);
        let target = include_str!("test-res/foo-openapi-components.yaml");
        assert!(super::eq_yaml(result.as_str(), target))
    }
}
