use bip39::{Language, Mnemonic};
use plotters::coord::types::RangedCoordf32;
use plotters::prelude::*;
use wasm_bindgen::prelude::*;

// Export a `greet` function from Rust to JavaScript, that alerts a
// hello message.
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("CD17kkh Hello, {} ! {}", name, bip39_last_word())
}

#[wasm_bindgen]
pub fn svg_img_dataurl() -> String {
    // [css - svg fill color not working with hex colors - Stack Overflow](https://stackoverflow.com/questions/61099149/svg-fill-color-not-working-with-hex-colors)
    // # in URLs starts a fragment identifier. So, in order to make that work, write %23 instead of #. 
    // That is the value of escaped # character.
    format!("data:image/svg+xml;utf8,{}", svg_output().replace("#", "%23"))
}

fn bip39_last_word() -> String {
    let lang = Language::ChineseTraditional;
    for x in 0..2048 {
        let phrase = format!(
            "真 實 無 雙 花 分 散 式 去 中 心 化 抗 拔 線 雙 花 風 險 很 難 難 難 {}",
            lang.wordlist().get_word(x.into())
        );
        if Mnemonic::validate(&phrase, lang).is_ok() {
            // println!("{}", phrase);
            return phrase;
        }
    }
    "零".to_string()
}

fn svg_output() -> String {
    let mut content: String = String::default();
    {
        // https://docs.rs/plotters-svg/latest/plotters_svg/struct.SVGBackend.html
        let root = SVGBackend::with_string(&mut content, (1200, 800)).into_drawing_area();
        let root = root.apply_coord_spec(Cartesian2d::<RangedCoordf32, RangedCoordf32>::new(
            0f32..1f32,
            0f32..34f32,
            (0..1200, 0..800),
        ));
        let dot_and_label = |msg: String, x: f32, y: f32| {
            return EmptyElement::at((x, y))
            // + Circle::new((0, 0), 3, ShapeStyle::from(&BLACK).filled())
            + Text::new(msg, (5, 0), ("sans-serif", 16.0).into_font());
        };
        let lang = Language::ChineseTraditional;
        for x in 0..32 {
            let mut a: String = String::default();
            for y in 0..64 {
                let index = y + x * 64;
                let word: &str = lang.wordlist().get_word(index.into());
                if y % 8 == 0 {
                    a.push_str(format!(" {:0>4} ", index).as_str());
                }
                a.push_str(word);
            }
            println!("{}", a);
            root.draw(&dot_and_label(a, 0.05, 1.0 * (x + 1) as f32))
                .unwrap();
        }
    }
    content.replace("\n", "")
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn it_works() {
        let result = 2 + 2;
        assert_eq!(result, 4);
        assert_eq!(
            "真 實 無 雙 花 分 散 式 去 中 心 化 抗 拔 線 雙 花 風 險 很 難 難 難 題",
            bip39_last_word()
        );
    }
}
