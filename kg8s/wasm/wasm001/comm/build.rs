fn main(){
    prost_build::compile_protos(&["src/addrbook.proto", "src/hpke.proto"], &["src/"]).unwrap();
}