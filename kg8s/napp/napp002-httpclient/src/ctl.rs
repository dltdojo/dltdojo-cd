use anyhow::Result;
use crate::cmd::ControlOptions;

pub(crate) fn process(opt: ControlOptions) -> Result<()> {
    println!("ctl opt : {:?}", opt);
    if let Some(url) = opt.geturl {
        println!("ctl opt : {:?}", url.as_str());
        let resp = reqwest::blocking::get("https://httpbin.org/ip")?
            .json::<std::collections::HashMap<String, String>>()?;                    println!("{:#?}", resp);
    } 
    Ok(())
}
