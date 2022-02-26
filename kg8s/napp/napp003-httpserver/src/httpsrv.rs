use crate::cmd::ServerOptions;
use axum::handler::Handler;
use rust_embed::RustEmbed;
use std::str::FromStr;
use tower_http::trace::TraceLayer;

//
// [axum/main.rs at main · tokio-rs/axum](https://github.com/tokio-rs/axum/blob/main/examples/key-value-store/src/main.rs)
// [rust-embed/axum.rs at master · pyros2097/rust-embed](https://github.com/pyros2097/rust-embed/blob/master/examples/axum.rs)
// [axum/main.rs at main · tokio-rs/axum](https://github.com/tokio-rs/axum/blob/main/examples/todos/src/main.rs)
//
#[derive(RustEmbed)]
#[folder = "public/"]
struct Asset;

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

async fn index_handler() -> impl axum::response::IntoResponse {
    static_handler("/index.html".parse::<axum::http::Uri>().unwrap()).await
}

//
// [Corrected route matching on axum example by robertwayne · Pull Request #169 · pyros2097/rust-embed](https://github.com/pyros2097/rust-embed/pull/169)
//
async fn static_handler(uri: axum::http::Uri) -> impl axum::response::IntoResponse {
    let path = uri.path().trim_start_matches('/').to_string();
    StaticFile(path)
}

#[derive(serde::Serialize)]
struct MsgHealth {
    health: bool,
}

// `Json` gives a content-type of `application/json` and works with any type
// that implements `serde::Serialize`
async fn handler_health_status() -> impl axum::response::IntoResponse {
    let x = MsgHealth {
        health: true
    };
    axum::Json(x)
}

async fn handler_404() -> impl axum::response::IntoResponse {
    (axum::http::StatusCode::NOT_FOUND, "nothing to see here")
}

pub(crate) async fn process(opt: ServerOptions) {
    cmd_server(false, opt).await;
}

async fn cmd_server(_debug: bool, args: ServerOptions) {
    use std::net::SocketAddr;
    let db = Db::default();
    let app = axum::Router::new()
        .route("/health", axum::routing::get(handler_health_status))
        .nest("/api/v1", api_v1_routes())
        .route("/", axum::routing::get(index_handler))
        .route("/index.html", axum::routing::get(index_handler))
        .route("/images/*file", static_handler.into_service())
        .route("/spec/*file", static_handler.into_service())
        .fallback(handler_404.into_service())
        .layer(
            tower::ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(tower_http::add_extension::AddExtensionLayer::new(db))
                .into_inner(),
        );

    let addr = SocketAddr::from_str(&args.socketaddr).unwrap();
    tracing::debug!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await;
}

fn api_v1_routes() -> axum::routing::Router {

    async fn todos_index(
        pagination: Option<axum::extract::Query<Pagination>>,
        axum::extract::Extension(db): axum::extract::Extension<Db>,
    ) -> impl axum::response::IntoResponse {
        let todos = db.read().unwrap();

        let axum::extract::Query(pagination) = pagination.unwrap_or_default();

        let todos = todos
            .values()
            .cloned()
            .skip(pagination.offset.unwrap_or(0))
            .take(pagination.limit.unwrap_or(usize::MAX))
            .collect::<Vec<_>>();

        axum::Json(todos)
    }

    async fn todos_create(
        axum::Json(input): axum::Json<CreateTodo>,
        axum::extract::Extension(db): axum::extract::Extension<Db>,
    ) -> impl axum::response::IntoResponse {
        let todo = Todo {
            id: uuid::Uuid::new_v4(),
            text: input.text,
            completed: false,
        };

        db.write().unwrap().insert(todo.id, todo.clone());

        (axum::http::StatusCode::CREATED, axum::Json(todo))
    }

    async fn todos_update(
        axum::extract::Path(id): axum::extract::Path<uuid::Uuid>,
        axum::Json(input): axum::Json<UpdateTodo>,
        axum::extract::Extension(db): axum::extract::Extension<Db>,
    ) -> Result<impl axum::response::IntoResponse, axum::http::StatusCode> {
        let mut todo = db
            .read()
            .unwrap()
            .get(&id)
            .cloned()
            .ok_or(axum::http::StatusCode::NOT_FOUND)?;

        if let Some(text) = input.text {
            todo.text = text;
        }

        if let Some(completed) = input.completed {
            todo.completed = completed;
        }

        db.write().unwrap().insert(todo.id, todo.clone());

        Ok(axum::Json(todo))
    }

    async fn todos_get(
        axum::extract::Path(id): axum::extract::Path<uuid::Uuid>,
        axum::extract::Extension(db): axum::extract::Extension<Db>,
    ) -> Result<impl axum::response::IntoResponse, axum::http::StatusCode> {
        let todo = db
            .read()
            .unwrap()
            .get(&id)
            .cloned()
            .ok_or(axum::http::StatusCode::NOT_FOUND)?;
        Ok(axum::Json(todo))
    }

    async fn todos_delete(
        axum::extract::Path(id): axum::extract::Path<uuid::Uuid>,
        axum::extract::Extension(db): axum::extract::Extension<Db>,
    ) -> impl axum::response::IntoResponse {
        if db.write().unwrap().remove(&id).is_some() {
            axum::http::StatusCode::NO_CONTENT
        } else {
            axum::http::StatusCode::NOT_FOUND
        }
    }

    axum::routing::Router::new()
        .route("/todos", axum::routing::get(todos_index).post(todos_create))
        .route(
            "/todos/:id",
            axum::routing::get(todos_get)
                .patch(todos_update)
                .post(todos_update)
                .delete(todos_delete),
        )
}

type Db = std::sync::Arc<std::sync::RwLock<std::collections::HashMap<uuid::Uuid, Todo>>>;

#[derive(Debug, serde::Serialize, Clone)]
struct Todo {
    id: uuid::Uuid,
    text: String,
    completed: bool,
}

// The query parameters for todos index
#[derive(Debug, serde::Deserialize, Default)]
pub struct Pagination {
    pub offset: Option<usize>,
    pub limit: Option<usize>,
}

#[derive(Debug, serde::Deserialize)]
struct CreateTodo {
    text: String,
}

#[derive(Debug, serde::Deserialize)]
struct UpdateTodo {
    text: Option<String>,
    completed: Option<bool>,
}
