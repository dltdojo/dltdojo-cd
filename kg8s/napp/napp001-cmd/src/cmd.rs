use structopt::StructOpt;

#[derive(Debug, StructOpt)]
#[structopt(name = "napp", about = "napp tool")]
pub struct NappCmdArgs {
    #[structopt(long, short)]
    pub(crate) debug: bool,
    #[structopt(subcommand)]
    pub(crate) command: Command,
}

#[derive(Debug, StructOpt)]
pub(crate) enum Command {
    #[structopt(name = "ctl", about = "control mode")]
    Control(ControlOptions),
    #[structopt(name = "srv", about = "server mode")]
    HttpServer(ServerOptions),
}

#[derive(Debug, StructOpt)]
pub(crate) struct ControlOptions {
    #[structopt(short = "i", long)]
    stdin: bool,
    #[structopt(default_value = "0", long, short, env)]
    num: u16,
}

#[derive(Debug, StructOpt, Clone)]
pub(crate) struct ServerOptions {
    #[structopt(default_value = "0.0.0.0:8000", long, env)]
    socketaddr: String,
}