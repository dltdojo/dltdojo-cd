mod httpsvc;
use axum::Router;
use std::net::SocketAddr;
use structopt::StructOpt;

#[derive(Debug, StructOpt)]
#[structopt(name = "ddjcd", about = "dltdojo-cd tool")]
struct Opt {
    #[structopt(long, short)]
    debug: bool,

    #[structopt(subcommand)]
    cmd: SubCommand,
}

#[derive(Debug, StructOpt)]
enum SubCommand {
    #[structopt(name = "client", about = "client mode")]
    Client(ClientOptions),
    #[structopt(name = "server", about = "server mode")]
    Server(ServerOptions),
}

#[derive(Debug, StructOpt)]
struct ServerOptions {
    #[structopt(default_value = "localhost", long, env)]
    host: String,
    #[structopt(default_value = "3000", long, env)]
    port: String,
}

#[derive(Debug, StructOpt)]
struct ClientOptions {
    #[structopt(short = "i", long)]
    stdin: bool,
    #[structopt(default_value = "0", long, short, env)]
    num_user: u16,
}

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let args = Opt::from_args();
    match args.cmd {
        SubCommand::Client(opt) => {
            let users = ddjcd_lib::fake_users(ddjcd_lib::RpcFaker{
                show_key: false,
                number: opt.num_user
            });
            let j = serde_json::to_string_pretty(&users).unwrap();
            println!("{}", j);
            Ok(())
        }
        SubCommand::Server(_opt) => {
            // build our application with a route
            let app = Router::new().nest("/", httpsvc::routes());
            let addr = SocketAddr::from(([0, 0, 0, 0], 3000));

            axum::Server::bind(&addr)
                .serve(app.into_make_service())
                .await
                .unwrap();
            //println!("{:?}", _opt);
            Ok(())
        }
    }
}
