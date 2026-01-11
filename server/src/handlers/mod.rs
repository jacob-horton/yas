use axum::Router;

use crate::AppState;

mod auth;
mod user;

// Combines all sub-modules into one router
pub fn api_router() -> Router<AppState> {
    Router::new().merge(auth::router()).merge(user::router())
}
