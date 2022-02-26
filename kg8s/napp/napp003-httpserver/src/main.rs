use anyhow::Result;
use structopt::StructOpt;
mod cmd;
mod ctl;
mod httpsrv;

#[tokio::main]
async fn main() -> Result<()> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "napp=debug,tower_http=debug,axum=debug")
    }
    tracing_subscriber::fmt::init();
    match cmd::MyArgs::from_args().command {
        cmd::Command::Control(opt) => ctl::process(opt),
        cmd::Command::HttpServer(opt) => {
            tracing::info!(message = "preparing to start http server", socketaddr=opt.socketaddr.as_str());
            httpsrv::process(opt).await;
            Ok(())
        }
    }
}
