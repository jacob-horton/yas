mod constants;
mod extractors;
mod handlers;
mod models;
mod repositories;
mod services;

use axum::{
    Router,
    routing::{delete, get, post},
};
use sqlx::postgres::PgPoolOptions;
use std::{env, net::SocketAddr, sync::Arc};
use tower_sessions::{Expiry, SessionManagerLayer, cookie::time::Duration};
use tower_sessions_sqlx_store::PostgresStore;

use crate::repositories::user_repo::UserRepo;

#[derive(Clone)]
pub struct AppState {
    pub user_repo: Arc<UserRepo>,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await
        .expect("Failed to connect to DB");

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("Failed to run migrations");

    // Setup session store (in postgres)
    let session_store = PostgresStore::new(pool.clone());
    session_store
        .migrate()
        .await
        .expect("Failed to init session store");

    let use_secure_cookies = env::var("SECURE_COOKIES").expect("SECURE_COOKIES must be set");
    let session_layer = SessionManagerLayer::new(session_store)
        .with_secure(use_secure_cookies == "true")
        .with_expiry(Expiry::OnInactivity(Duration::days(30)));

    // Setup repositories & state
    let user_repo = Arc::new(UserRepo::new(pool.clone()));
    let app_state = AppState { user_repo };

    let app = Router::new()
        .route("/user", post(handlers::auth::create_user))
        .route("/session", post(handlers::auth::create_session))
        .route("/session", delete(handlers::auth::delete_session))
        .route("/session", get(handlers::auth::get_session))
        .layer(session_layer)
        .with_state(app_state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
