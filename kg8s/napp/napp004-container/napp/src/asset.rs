use rust_embed::RustEmbed;

//
// [axum/main.rs at main · tokio-rs/axum](https://github.com/tokio-rs/axum/blob/main/examples/key-value-store/src/main.rs)
// [rust-embed/axum.rs at master · pyros2097/rust-embed](https://github.com/pyros2097/rust-embed/blob/master/examples/axum.rs)
// [axum/main.rs at main · tokio-rs/axum](https://github.com/tokio-rs/axum/blob/main/examples/todos/src/main.rs)
//
#[derive(RustEmbed)]
#[folder = "public/"]
pub(crate) struct Asset;

pub struct StaticFile<T>(pub T);

impl<T> axum::response::IntoResponse for StaticFile<T>
where
    T: Into<String>,
{
    fn into_response(self) -> axum::response::Response {
        let path = self.0.into();

        match Asset::get(path.as_str()) {
            Some(content) => {
                let body = axum::body::boxed(axum::body::Full::from(content.data));
                let mime = mime_guess::from_path(path).first_or_octet_stream();
                axum::response::Response::builder()
                    .header(axum::http::header::CONTENT_TYPE, mime.as_ref())
                    .body(body)
                    .unwrap()
            }
            None => axum::response::Response::builder()
                .status(axum::http::StatusCode::NOT_FOUND)
                .body(axum::body::boxed(axum::body::Full::from("404")))
                .unwrap(),
        }
    }
}

pub async fn index_handler() -> impl axum::response::IntoResponse {
    static_handler("/index.html".parse::<axum::http::Uri>().unwrap()).await
}

//
// [Corrected route matching on axum example by robertwayne · Pull Request #169 · pyros2097/rust-embed](https://github.com/pyros2097/rust-embed/pull/169)
//
pub async fn static_handler(uri: axum::http::Uri) -> impl axum::response::IntoResponse {
    let path = uri.path().trim_start_matches('/').to_string();
    StaticFile(path)
}

pub fn asset_to_string(path: &str) -> String {
    let embedded_file = Asset::get(path).unwrap();
    std::str::from_utf8(embedded_file.data.as_ref()).unwrap().to_string()
}