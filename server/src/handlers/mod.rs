use axum::Router;

use crate::AppState;

mod auth;
mod game;
mod game_match;
mod group;
mod invite;
mod stats;
mod user;

// Combines all sub-modules into one router
pub fn api_router() -> Router<AppState> {
    Router::new()
        .merge(auth::router())
        .merge(user::router())
        .merge(group::router())
        .merge(invite::router())
        .merge(game::router())
        .merge(game_match::router())
        .merge(stats::router())
}
