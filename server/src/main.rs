mod constants;
mod errors;
mod extractors;
mod handlers;
mod models;
mod policies;
mod repositories;
mod services;

use axum::{
    Extension, Router,
    http::{
        HeaderValue, Method,
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
    },
    middleware,
};
use resend_rs::Resend;
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::{env, net::SocketAddr, sync::Arc};
use tower_http::cors::CorsLayer;
use tower_sessions::{Expiry, SessionManagerLayer, cookie::SameSite};
use tower_sessions_sqlx_store::PostgresStore;

use crate::{
    extractors::rate_limiting::ip::{create_ip_limiter, ip_limit_mw},
    repositories::{
        game_repo::GameRepo, group_repo::GroupRepo, invite_repo::InviteRepo, match_repo::MatchRepo,
        password_resets_repo::PasswordResetsRepo, stats_repo::StatsRepo, user_repo::UserRepo,
        verification_repo::VerificationRepo,
    },
    services::email::EmailService,
};

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,

    pub email_service: Arc<EmailService>,

    pub password_resets_repo: Arc<PasswordResetsRepo>,
    pub verification_repo: Arc<VerificationRepo>,
    pub user_repo: Arc<UserRepo>,
    pub group_repo: Arc<GroupRepo>,
    pub invite_repo: Arc<InviteRepo>,
    pub game_repo: Arc<GameRepo>,
    pub match_repo: Arc<MatchRepo>,
    pub stats_repo: Arc<StatsRepo>,
}

impl AppState {
    fn new(pool: PgPool) -> Self {
        let user_repo = Arc::new(UserRepo {});
        let group_repo = Arc::new(GroupRepo {});
        let invite_repo = Arc::new(InviteRepo {});
        let game_repo = Arc::new(GameRepo {});
        let match_repo = Arc::new(MatchRepo {});
        let stats_repo = Arc::new(StatsRepo {});
        let verification_repo = Arc::new(VerificationRepo {});
        let password_resets_repo = Arc::new(PasswordResetsRepo {});

        let resend_client = Resend::new(&env::var("RESEND_KEY").expect("RESEND_KEY must be set"));
        let email_service = Arc::new(EmailService { resend_client });

        Self {
            pool: pool.clone(),

            email_service,

            password_resets_repo,
            verification_repo,
            user_repo,
            group_repo,
            invite_repo,
            game_repo,
            match_repo,
            stats_repo,
        }
    }
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
        .with_http_only(true)
        .with_same_site(SameSite::Lax)
        .with_expiry(Expiry::OnInactivity(
            tower_sessions::cookie::time::Duration::days(30),
        ));

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

    let app_state = AppState::new(pool.clone());

    // Clean up expired tokens each hour
    let cleanup_pool = app_state.pool.clone();
    let cleanup_verification_repo = app_state.verification_repo.clone();
    let cleanup_password_reset_repo = app_state.password_resets_repo.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(std::time::Duration::from_secs(60 * 60));

        loop {
            interval.tick().await; // Wait for the next tick

            match cleanup_verification_repo
                .delete_expired_tokens(&cleanup_pool)
                .await
            {
                Ok(count) => println!("Cleaned up {} expired email verification tokens", count),
                Err(e) => eprintln!("Failed to clean up email verification tokens: {}", e),
            }

            match cleanup_password_reset_repo
                .delete_expired_tokens(&cleanup_pool)
                .await
            {
                Ok(count) => println!("Cleaned up {} expired password reset tokens", count),
                Err(e) => eprintln!("Failed to clean up password reset tokens: {}", e),
            }
        }
    });

    let app = Router::new()
        .nest("/api", handlers::api_router())
        .layer(session_layer) // Handles sessions/auth
        .layer(middleware::from_fn(ip_limit_mw))
        .layer(Extension(create_ip_limiter(100, 10)))
        .layer(cors_layer)
        .with_state(app_state);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8000));
    println!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<std::net::SocketAddr>(),
    )
    .await
    .unwrap();
}
