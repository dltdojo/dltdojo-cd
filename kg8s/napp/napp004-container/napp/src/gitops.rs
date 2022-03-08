use crate::asset::asset_to_string;
use crate::cmd::{EmbeddedK8sRes, GitopsSubCmdOptions};
use anyhow::Result;

//
// kubectl port-forward statefulset/gitea 3000:3000
//
pub(crate) fn handle(opt: GitopsSubCmdOptions, kubectl_cmd: String) -> Result<()> {
    if opt.remote && (opt.res_url.is_some() || opt.type_res.is_some()) {
        if opt.dry_run {
            todo!();
        } else {
            let x = to_endpoint(opt);
            cmd_lib::run_cmd!(kubectl ${kubectl_cmd} -f ${x})?;
        }
    } else if opt.res_path.is_some() || opt.type_res.is_some() {
        let x = to_path(opt.clone());
        let target_yaml = asset_to_string(&x);
        if opt.dry_run {
            println!("{}", target_yaml);
        } else {
            cmd_lib::run_cmd!(echo ${target_yaml} | kubectl ${kubectl_cmd} -f -)?;
        }
    }
    Ok(())
}

pub(crate) fn process_delete(opt: GitopsSubCmdOptions) -> Result<()> {
    handle(opt, "delete".to_string())
}

pub(crate) fn process_create(opt: GitopsSubCmdOptions) -> Result<()> {
    handle(opt, "apply".to_string())
}

fn to_path(opt: GitopsSubCmdOptions) -> String {
    // gitea default vaule = "k8s/gitea/gitea-sqlite3.yaml"
    let mut x = String::new();
    if opt.res_path.is_some() {
        x = opt.res_path.unwrap();
    } else if opt.type_res.is_some() {
        match opt.type_res.unwrap() {
            EmbeddedK8sRes::Gitea => {
                x = "k8s/gitea/gitea-sqlite3.yaml".to_string();
            }
            EmbeddedK8sRes::Argocd => todo!(),
            EmbeddedK8sRes::Vault => todo!(),
            EmbeddedK8sRes::Keycloak => todo!(),
        }
    }
    x
}

fn to_endpoint(opt: GitopsSubCmdOptions) -> String {
    // gitea default vaule = "http://localhost:3000/k8s/gitea/gitea-sqlite3.yaml"
    let mut x = String::new();
    if let Some(v) = opt.res_url {
        x = v.as_str().to_string();
    } else if opt.type_res.is_some() {
        match opt.type_res.unwrap() {
            EmbeddedK8sRes::Gitea => {
                x = "http://localhost:3000/k8s/gitea/gitea-sqlite3.yaml".to_string();
            }
            EmbeddedK8sRes::Argocd => todo!(),
            EmbeddedK8sRes::Vault => todo!(),
            EmbeddedK8sRes::Keycloak => todo!(),
        }
    }
    x
}
