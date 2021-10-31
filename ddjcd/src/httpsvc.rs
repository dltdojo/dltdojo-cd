use axum::{
    handler::{get, post},
    http::StatusCode,
    response::IntoResponse,
    routing::BoxRoute,
    Json, Router,
};
use serde::{Deserialize, Serialize};

pub fn routes() -> Router<BoxRoute> {
    let router = Router::new()
        .route("/", get(root))
        // curl -d '{"username":"foo"}' -H "Content-Type: application/json" -X POST http://localhost:3000/users
        .route("/users", post(create_user));
    router.boxed()
}

// basic handler that responds with a static string
pub async fn root() -> &'static str {
    "Hello, World!"
}

pub async fn create_user(
    // this argument tells axum to parse the request body
    // as JSON into a `CreateUser` type
    Json(payload): Json<CreateUser>,
) -> impl IntoResponse {
    // insert your application logic here
    let user = User {
        id: 1337,
        username: payload.username,
    };

    // this will be converted into a JSON response
    // with a status code of `201 Created`
    (StatusCode::CREATED, Json(user))
}

// the input to our `create_user` handler
#[derive(Deserialize)]
pub struct CreateUser {
    username: String,
}

// the output to our `create_user` handler
#[derive(Serialize)]
pub struct User {
    id: u64,
    username: String,
}
