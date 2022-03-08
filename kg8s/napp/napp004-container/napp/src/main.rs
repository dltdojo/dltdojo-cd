use anyhow::Result;
use clap::Parser;
mod cmd;
mod ctl;
mod srv;
mod info;
mod gitops;
mod asset;

#[tokio::main]
async fn main() -> Result<()> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "napp=info,tower_http=debug,axum=debug");
    }
    tracing_subscriber::fmt::init();

    match cmd::AppArg::parse().command {
        Some(cmd::CommandEnum::Control(v)) => ctl::process(v),
        Some(cmd::CommandEnum::NappInfo(v) )=> info::process_info(v),
        Some(cmd::CommandEnum::Operator(v) )=> {
            println!("{:?}", v);
            Ok(())
        },
        Some(cmd::CommandEnum::Gitops(v) )=> {
            match v.command {
                cmd::GitopsEnum::Create(v) => gitops::process_create(v),
                cmd::GitopsEnum::Delete(v) => gitops::process_delete(v),
            }
        },
        Some(cmd::CommandEnum::HttpServer(v) )=> {
            tracing::info!(
                message = "preparing to start http server",
                socketaddr = v.socketaddr.as_str()
            );
            srv::process(v).await;
            Ok(())
        },
        _ => Ok(()),
    }
}
