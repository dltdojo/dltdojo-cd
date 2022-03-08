use crate::cmd::*;
use anyhow::Result;

pub(crate) fn process(opt: ControlOptions) -> Result<()> {
    println!("ctl opt : {:?}", opt);
    if let Some(url) = opt.geturl {
        println!("ctl opt : {:?}", url.as_str());
        let resp = ureq::get("https://httpbin.org/ip").call()?.into_string()?;
        println!("{:#?}", resp);
    }
    Ok(())
}