mod constants;
mod errors;
mod extractors;
mod handlers;
mod models;
mod policies;
mod repositories;
mod services;

use axum::{
    Router,
    http::{
        HeaderValue, Method,
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
    },
};
use resend_rs::Resend;
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::{env, net::SocketAddr, sync::Arc};
use tower_http::cors::CorsLayer;
use tower_sessions::{Expiry, SessionManagerLayer, cookie::time::Duration};
use tower_sessions_sqlx_store::PostgresStore;

use crate::repositories::{
    email_repo::EmailRepo, game_repo::GameRepo, group_repo::GroupRepo, invite_repo::InviteRepo,
    match_repo::MatchRepo, stats_repo::StatsRepo, user_repo::UserRepo,
};

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,

    pub email_repo: EmailRepo,
    pub user_repo: Arc<UserRepo>,
    pub group_repo: Arc<GroupRepo>,
    pub invite_repo: Arc<InviteRepo>,
    pub game_repo: Arc<GameRepo>,
    pub match_repo: Arc<MatchRepo>,
    pub stats_repo: Arc<StatsRepo>,
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    let resend_client = Resend::new(&env::var("RESEND_KEY").expect("RESEND_KEY must be set"));

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

    let cors_layer = CorsLayer::new()
        .allow_origin("http://localhost:3000".parse::<HeaderValue>().unwrap())
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PATCH,
            Method::PUT,
            Method::DELETE,
        ])
        .allow_headers([CONTENT_TYPE, AUTHORIZATION, ACCEPT])
        .allow_credentials(true);

    // Setup repositories & state
    let user_repo = Arc::new(UserRepo {});
    let group_repo = Arc::new(GroupRepo {});
    let invite_repo = Arc::new(InviteRepo {});
    let game_repo = Arc::new(GameRepo {});
    let match_repo = Arc::new(MatchRepo {});
    let stats_repo = Arc::new(StatsRepo {});

    let email_repo = EmailRepo { resend_client };

    let app_state = AppState {
        pool: pool.clone(),

        email_repo,
        user_repo,
        group_repo,
        invite_repo,
        game_repo,
        match_repo,
        stats_repo,
    };

    let app = Router::new()
        .nest("/api", handlers::api_router())
        .layer(session_layer) // Handles sessions/auth
        .layer(cors_layer)
        .with_state(app_state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    println!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
