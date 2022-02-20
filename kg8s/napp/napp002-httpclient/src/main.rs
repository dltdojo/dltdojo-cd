use cmd::NappCmdArgs;
use structopt::StructOpt;
use anyhow::Result;

mod cmd;
mod ctl;

fn main() -> Result<()> {
    match NappCmdArgs::from_args().command {
        cmd::Command::Control(opt) => {
            ctl::process(opt)
        }
        cmd::Command::HttpServer(opt) => {
            println!("http server opt : {:?}", opt);
            Ok(())
        }
    }
}