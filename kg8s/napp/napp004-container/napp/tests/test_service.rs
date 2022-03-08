use assert_cmd::prelude::*;
use predicates::prelude::*;
use ureq::OrAnyStatus;
use std::process::Command;
mod common;

#[test]
fn runs() {
    let mut cmd = Command::cargo_bin("napp").unwrap();
    cmd.assert()
        .failure()
        .stderr(predicate::str::contains("USAGE"));
}

#[test]
fn req_index() {
    //
    // [algesten/ureq: Minimal request library in rust.](https://github.com/algesten/ureq)
    //
    let mut process_child_srv = common::setup_srv();

    let final_result = std::panic::catch_unwind(|| {
        let agent = common::setup_ureq_agent();

        // blocking to wait the service ready.

        for _n in 0..10 {
            let result = agent.get("http://localhost:3000/").call().or_any_status();
            if result.is_ok() {
                assert_eq!(result.unwrap().status(), 200);
                break;
            }
            std::thread::sleep(std::time::Duration::from_secs(2));
        }

        let resp_health = agent.get("http://localhost:3000/health").call().unwrap();
        assert_eq!(resp_health.status(), 200);
        let json_health: serde_json::Value = resp_health.into_json().unwrap();
        assert_eq!(json_health, serde_json::json!({"health": true}));

        let result_foo = agent.get("http://localhost:3000/foo").call().or_any_status();
        assert!(result_foo.is_ok());
        assert_eq!(result_foo.unwrap().status(), 404);
    });

    // kill child process with panic
    process_child_srv.kill().unwrap();

    assert!(final_result.is_ok());
}
