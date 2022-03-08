use crate::cmd::*;
use anyhow::Result;

use kube::CustomResourceExt;
use schemars::{schema_for, JsonSchema};
use serde::{Deserialize, Serialize};

use once_cell::sync::OnceCell;

static SYS_INFO: OnceCell<String> = OnceCell::new();

#[derive(Deserialize, Serialize, JsonSchema)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct MyStruct {
    pub my_int: i32,
    pub my_bool: bool,
    some_data: std::collections::HashMap<String, usize>,
}

#[derive(kube::CustomResource, Debug, Serialize, Deserialize, Default, Clone, JsonSchema)]
#[kube(group = "clux.dev", version = "v1", kind = "Foo", namespaced)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct FooSpec {
    name: String,
    info: String,
    my_bool: bool,
    some_data: std::collections::HashMap<String, usize>,
}


pub(crate) fn schema_json_foospec() -> String {
    let schema = schemars::schema_for!(FooSpec);
    serde_json::to_string_pretty(&schema).unwrap()
}

pub(crate) fn schema_crd_foospec() -> String {
    let crd = Foo::crd();
    // println!("foo: {:?}", f);
    serde_yaml::to_string(&crd).unwrap()
}


pub(crate) fn mystruct_to_json_schema() -> String {
    let schema = schema_for!(MyStruct);
    serde_json::to_string_pretty(&schema).unwrap()
}

pub(crate) fn process_info(opt: InfoOptions) -> Result<()> {
    let my_data_json = r#"
    {
        "myInt": 7,
        "myBool": true,
        "someData": {
        "x": 3,
        "y": 2,
        "z": 3
    }
}
"#;

    let xx = serde_json::from_str::<MyStruct>(my_data_json)?;

    if opt.schema {
        println!("{}", mystruct_to_json_schema());
    } else if opt.sysinfo {
        let sysinfo = SYS_INFO.get_or_init(|| "info message".to_string());
        println!("{}", sysinfo);
    } else if opt.test {
        // openapi v3 petstore example
        // [OpenAPI-Specification/petstore.yaml at main · OAI/OpenAPI-Specification](https://github.com/OAI/OpenAPI-Specification/blob/main/examples/v3.0/petstore.yaml)

        let crd = Foo::crd();
        // println!("foo: {:?}", f);
        println!("{}", serde_yaml::to_string(&crd)?);

        // https://docs.rs/k8s-openapi/latest/k8s_openapi/apiextensions_apiserver/pkg/apis/apiextensions/v1/struct.JSONSchemaProps.html
        // let openapi_schema_from_crd = crd.spec.versions[0].schema.as_ref().unwrap().open_api_v3_schema.as_ref().unwrap();
        let schema_openapi_crd =
            serde_yaml::to_value(crd.spec.versions[0].schema.as_ref().unwrap())?;
        //println!("{}", serde_yaml::to_string(&x["openAPIV3Schema"]["properties"]["spec"]).unwrap());

        let openapi_com_schemas = r#"
        components:
          schemas:
            Foo: {}
        "#;

        let mut target_foo = serde_yaml::from_str::<serde_yaml::Value>(openapi_com_schemas)?;
        // println!("{}", serde_yaml::to_string(&target_foo)?);
        //let mut m = serde_yaml::Mapping::new();
        //m.insert("key".into(), "value".into());
        //target_foo["components"]["schemas"]["Foo"] = serde_yaml::to_value(openapi_schema_from_crd)?;
        target_foo["components"]["schemas"]["Foo"] =
            schema_openapi_crd["openAPIV3Schema"]["properties"]["spec"].clone();
        println!("{}", serde_yaml::to_string(&target_foo)?);
    } else {
        match opt.output {
            OutputFormat::Json => {
                let jj = serde_json::to_string_pretty(&xx)?;
                println!("{}", jj)
            }
            OutputFormat::Yaml => {
                let yy = serde_yaml::to_string(&xx)?;
                println!("{}", yy);
            }
            OutputFormat::Toml => {
                let tt = toml::to_string(&xx)?;
                println!("{}", tt);
            }
        }
    }
    Ok(())
}


#[cfg(test)]
mod tests {
    #[test]
    fn json_schema() {
        let result = super::schema_json_foospec();
        println!("{}", result);
        assert!(result.contains("http://json-schema.org/draft-07/schema"));
    }
    
    #[test]
    fn crd_schema() {
        let result = super::schema_crd_foospec();
        println!("{}", result);
        assert!(result.contains("kind: CustomResourceDefinition"));
    }
}