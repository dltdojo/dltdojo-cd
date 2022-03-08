use strum::{EnumString, EnumVariantNames, VariantNames};

#[derive(Debug, clap::Parser)]
pub(crate) struct AppArg {
    #[clap(subcommand)]
    pub(crate) command: Option<CommandEnum>,
}

#[derive(Debug, clap::Parser)]
pub(crate) struct SubCmdGitops {
    #[clap(subcommand)]
    pub(crate) command: GitopsEnum,
}


#[derive(Debug, clap::Subcommand)]
pub(crate) enum CommandEnum {
    #[clap(name = "ctl", about = "💁 control")]
    Control(ControlOptions),
    #[clap(name = "info", about = "napp common info")]
    NappInfo(InfoOptions),
    #[clap(name = "srv", about = "🔑 server mode")]
    HttpServer(ServerOptions),
    #[clap(name = "opr", about = "kubernetes operator mode")]
    Operator(ServerOptions),
    #[clap(name = "gitops", about = "gitops services (gitea/argocd)")]
    Gitops(SubCmdGitops),
}

#[derive(Debug, clap::Subcommand, Clone)]
pub(crate) enum GitopsEnum {
    #[clap(about = "💁 Create k8s object")]
    Create(GitopsSubCmdOptions),
    #[clap(about = "💁 Delete k8s object")]
    Delete(GitopsSubCmdOptions),
}

#[derive(Debug, Clone, EnumString, EnumVariantNames)]
#[strum(serialize_all = "kebab_case")]
pub(crate) enum OutputFormat {
    Json,
    Yaml,
    Toml,
}

#[derive(Debug, Clone, EnumString, EnumVariantNames)]
#[strum(serialize_all = "kebab_case")]
pub(crate) enum EmbeddedK8sRes {
    Gitea,
    Argocd,
    Vault,
    Keycloak,
}

#[derive(Debug, clap::Parser)]
pub(crate) struct ControlOptions {
    #[structopt(long, env)]
    pub(crate) geturl: Option<url::Url>,
}

#[derive(Debug, clap::Parser, Clone)]
pub(crate) struct ServerOptions {
    #[clap(default_value = "0.0.0.0:3000", long, env)]
    pub(crate) socketaddr: String,
}

static EXAMPLE_HELP: &str = r#"Wrapped kubectl apply embedded gitops resources
🔑Example Install Local Gitea Resources:
 - gitops create -t gitea
 - gitops create --res-path=k8s/gitea/gitea-sqlite3.yaml
🔑Example Install Remote Gitea Resources
 - gitops create -t gitea --remote
 - gitops create --remote --res-url=http://localhost:3000/k8s/gitea/gitea-sqlite3.yaml"#;


#[derive(Debug, clap::Parser, Clone)]
pub(crate) struct GitopsSubCmdOptions {
    /// print k8s resources
    #[structopt(long)]
    pub(crate) dry_run: bool,

    /// apply/delete remote http endpoint resources
    #[structopt(short = 'r', long)]
    pub(crate) remote: bool,
    
    /// http endpoint of gitea k8s resources
    #[clap(long,env)]
    pub(crate) res_url: Option<url::Url>,
    
    /// the public/path of k8s resources
    #[structopt(long, env)]
    pub(crate) res_path: Option<String>,

    /// the type of embedded Kubernetes resources
    #[clap(short = 't', long, env, 
    possible_values = EmbeddedK8sRes::VARIANTS,
    help = EXAMPLE_HELP
    )]
    pub(crate) type_res: Option<EmbeddedK8sRes>,
}

#[derive(Debug, clap::Parser, Clone)]
pub(crate) struct InfoOptions {
    /// output format schema
    #[clap(short = 's', long)]
    pub(crate) schema: bool,

    /// output sysinfo
    #[clap(short = 'i', long)]
    pub(crate) sysinfo: bool,

    /// test output
    #[clap(short = 't', long)]
    pub(crate) test: bool,
    /// Output format. One of: json|yaml
    #[clap(short = 'o', long, env, 
    possible_values = OutputFormat::VARIANTS,
    default_value = OutputFormat::VARIANTS[0])]
    pub(crate) output: OutputFormat,
}
