use assert_cmd::Command;

#[test]
fn runs() {
    let mut cmd = Command::cargo_bin("napp").unwrap();
    cmd.assert().failure();
}