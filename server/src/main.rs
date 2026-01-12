mod constants;
mod errors;
mod extractors;
mod handlers;
mod models;
mod policies;
mod repositories;
mod services;

use axum::Router;
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::{env, net::SocketAddr, sync::Arc};
use tower_sessions::{Expiry, SessionManagerLayer, cookie::time::Duration};
use tower_sessions_sqlx_store::PostgresStore;

use crate::repositories::{
    game_repo::GameRepo, group_repo::GroupRepo, invite_repo::InviteRepo, user_repo::UserRepo,
};

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,

    pub user_repo: Arc<UserRepo>,
    pub group_repo: Arc<GroupRepo>,
    pub invite_repo: Arc<InviteRepo>,
    pub game_repo: Arc<GameRepo>,
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
    let user_repo = Arc::new(UserRepo {});
    let group_repo = Arc::new(GroupRepo {});
    let invite_repo = Arc::new(InviteRepo {});
    let game_repo = Arc::new(GameRepo {});

    let app_state = AppState {
        pool: pool.clone(),
        user_repo,
        group_repo,
        invite_repo,
        game_repo,
    };

    let app = Router::new()
        .nest("/api", handlers::api_router())
        .layer(session_layer) // Handles sessions/auth
        .with_state(app_state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    println!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
