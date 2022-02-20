use crate::cmd::ServerOptions;
use axum::handler::Handler;
use axum::response::{Html, IntoResponse, Response};
use axum::routing::get;
use rust_embed::RustEmbed;
use std::str::FromStr;
use tower_http::trace::TraceLayer;

//
// [rust-embed/axum.rs at master · pyros2097/rust-embed](https://github.com/pyros2097/rust-embed/blob/master/examples/axum.rs)
//
#[derive(RustEmbed)]
#[folder = "public/"]
struct Asset;

pub struct StaticFile<T>(pub T);

impl<T> IntoResponse for StaticFile<T>
where
    T: Into<String>,
{
    fn into_response(self) -> Response {
        let path = self.0.into();

        match Asset::get(path.as_str()) {
            Some(content) => {
                let body = axum::body::boxed(axum::body::Full::from(content.data));
                let mime = mime_guess::from_path(path).first_or_octet_stream();
                Response::builder()
                    .header(axum::http::header::CONTENT_TYPE, mime.as_ref())
                    .body(body)
                    .unwrap()
            }
            None => Response::builder()
                .status(axum::http::StatusCode::NOT_FOUND)
                .body(axum::body::boxed(axum::body::Full::from("404")))
                .unwrap(),
        }
    }
}

async fn index_handler() -> impl IntoResponse {
    static_handler("/index.html".parse::<axum::http::Uri>().unwrap()).await
}

//
// [Corrected route matching on axum example by robertwayne · Pull Request #169 · pyros2097/rust-embed](https://github.com/pyros2097/rust-embed/pull/169)
//
async fn static_handler(uri: axum::http::Uri) -> impl IntoResponse {
    let path = uri.path().trim_start_matches('/').to_string();
    StaticFile(path)
}

async fn handler_hello() -> Html<&'static str> {
    Html("<h1>Hello, World!</h1>")
}

async fn handler_404() -> impl IntoResponse {
    (axum::http::StatusCode::NOT_FOUND, "nothing to see here")
}

pub(crate) async fn process(opt: ServerOptions) {
    cmd_server(false, opt).await;
}

async fn cmd_server(_debug: bool, args: ServerOptions) {
    use std::net::SocketAddr;
    let app = axum::Router::new()
        .route("/hello", axum::routing::get(handler_hello))
        .route("/", get(index_handler))
        .route("/index.html", get(index_handler))
        .route("/images/*file", static_handler.into_service())
        .route("/spec/*file", static_handler.into_service())
        .fallback(handler_404.into_service())
        .layer(TraceLayer::new_for_http());

    let addr = SocketAddr::from_str(&args.socketaddr).unwrap();
    tracing::debug!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await;
}
