use structopt::StructOpt;

mod cmd;

fn main() {
    match cmd::NappCmdArgs::from_args().command {
        cmd::Command::Control(opt) => {
            println!("control opt : {:?}", opt);
        }

        cmd::Command::HttpServer(opt) => {
            println!("http service opt : {:?}", opt);
        }
    }
}
