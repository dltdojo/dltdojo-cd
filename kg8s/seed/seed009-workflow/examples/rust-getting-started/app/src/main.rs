use std::{thread, time};

fn main() {
    let mut count = 0u32;
    let delay = time::Duration::from_secs(5);
    loop{
        count += 1;
        println!("[TEST109] sleeping for 5  sec : {}", count);
        thread::sleep(delay);
    }
}
