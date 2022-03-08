use assert_cmd::prelude::*;
use std::process::Command;
use std::time::Duration;

pub fn setup_srv() -> std::process::Child {
    //Command::cargo_bin(env!("CARGO_PKG_NAME"))
    Command::cargo_bin("napp")
        .unwrap()
        .args(&["srv"])
        .spawn()
        .unwrap()
}

pub fn setup_ureq_agent() -> ureq::Agent {
    ureq::AgentBuilder::new()
        .timeout(Duration::from_secs(10))
        .build()
}
