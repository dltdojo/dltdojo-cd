use clap::Parser;
use std::io::Read;

mod shim;

/// Simple Wasm test tool
#[derive(Parser, Debug)]
#[clap(author, version, about, long_about = None)]
struct Args {
    /// Name of the person to greet
    #[clap(short, long)]
    name: Option<String>,

    #[clap(short = 'i', long)]
    stdin: bool,

    /// Number of times to greet
    #[clap(short, long, default_value_t = 1)]
    count: u8,
}


fn main() {
    let opt = Args::parse();
    if opt.stdin {
        let mut buffer = String::new();
        let _r = std::io::stdin().read_to_string(&mut buffer);
        println!("{}", buffer);
    } else{
        let x = comm::get_csf_yaml();
        println!("{}", x);
        println!("{:#?}", opt);

    }
}



#[cfg(test)]
mod tests {
    #[test]
    fn lib_common_crd_schema() {
        let result = comm::schema::schema_crd_foo();
        println!("{}", result);
        assert!(result.contains("kind: CustomResourceDefinition"));
    }
}
