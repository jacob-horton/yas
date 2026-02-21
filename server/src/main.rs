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
use governor::{Quota, RateLimiter};
use resend_rs::Resend;
use sqlx::{PgPool, postgres::PgPoolOptions};
use std::{env, net::SocketAddr, num::NonZeroU32, sync::Arc, time::Duration};
use tower_http::cors::CorsLayer;
use tower_sessions::{Expiry, SessionManagerLayer, cookie::SameSite};
use tower_sessions_sqlx_store::PostgresStore;

use crate::{
    extractors::rate_limiting::{email::EmailLimiter, ip::IpLimiter, user_id::UserIdLimiter},
    repositories::{
        email_repo::EmailRepo, game_repo::GameRepo, group_repo::GroupRepo, invite_repo::InviteRepo,
        match_repo::MatchRepo, stats_repo::StatsRepo, user_repo::UserRepo,
    },
};

#[derive(Clone)]
pub struct RateLimiters {
    pub login_ip_limiter: Arc<IpLimiter>,
    pub login_email_limiter: Arc<EmailLimiter>,

    pub register_ip_limiter: Arc<IpLimiter>,
    pub register_email_limiter: Arc<EmailLimiter>,

    pub change_password_ip_limiter: Arc<IpLimiter>,
    pub change_password_user_id_limiter: Arc<UserIdLimiter>,

    pub invite_ip_limiter: Arc<IpLimiter>,

    pub verify_email_ip_limiter: Arc<IpLimiter>,

    pub create_group_ip_limiter: Arc<IpLimiter>,
    pub create_game_ip_limiter: Arc<IpLimiter>,
    pub create_match_ip_limiter: Arc<IpLimiter>,
}

impl RateLimiters {
    fn new() -> Self {
        Self {
            // Login: 10 IP requests per minute (1 token per 6s)
            // 5 Email requests per 15 mins (1 token per 180s)
            login_ip_limiter: Arc::new(RateLimiter::keyed(
                Quota::with_period(Duration::from_secs(6))
                    .unwrap()
                    .allow_burst(NonZeroU32::new(10).unwrap()),
            )),
            login_email_limiter: Arc::new(RateLimiter::keyed(
                Quota::with_period(Duration::from_secs(180))
                    .unwrap()
                    .allow_burst(NonZeroU32::new(5).unwrap()),
            )),

            // Register: 5 IP requests per hour (1 token per 720s)
            // 3 Email requests per hour (1 token per 1200s)
            register_ip_limiter: Arc::new(RateLimiter::keyed(
                Quota::with_period(Duration::from_secs(720))
                    .unwrap()
                    .allow_burst(NonZeroU32::new(5).unwrap()),
            )),
            register_email_limiter: Arc::new(RateLimiter::keyed(
                Quota::with_period(Duration::from_secs(1200))
                    .unwrap()
                    .allow_burst(NonZeroU32::new(3).unwrap()),
            )),

            // Change password: 5 IP requests per hour (1 token per 720s)
            // 3 User/Email requests per hour (1 token per 1200s)
            change_password_ip_limiter: Arc::new(RateLimiter::keyed(
                Quota::with_period(Duration::from_secs(720))
                    .unwrap()
                    .allow_burst(NonZeroU32::new(5).unwrap()),
            )),
            change_password_user_id_limiter: Arc::new(RateLimiter::keyed(
                Quota::with_period(Duration::from_secs(1200))
                    .unwrap()
                    .allow_burst(NonZeroU32::new(3).unwrap()),
            )),

            // Invites (view and accept): 20 per minute (1 token per 3s)
            invite_ip_limiter: Arc::new(RateLimiter::keyed(
                Quota::with_period(Duration::from_secs(3))
                    .unwrap()
                    .allow_burst(NonZeroU32::new(20).unwrap()),
            )),

            // Verify Email: 10 IP requests per hour (1 token per 360s)
            verify_email_ip_limiter: Arc::new(RateLimiter::keyed(
                Quota::with_period(Duration::from_secs(360))
                    .unwrap()
                    .allow_burst(NonZeroU32::new(10).unwrap()),
            )),

            // Create group: 5 per hour (1 token per 720s)
            create_group_ip_limiter: Arc::new(RateLimiter::keyed(
                Quota::with_period(Duration::from_secs(720))
                    .unwrap()
                    .allow_burst(NonZeroU32::new(5).unwrap()),
            )),

            // Create game: 5 per hour (1 token per 720s)
            create_game_ip_limiter: Arc::new(RateLimiter::keyed(
                Quota::with_period(Duration::from_secs(720))
                    .unwrap()
                    .allow_burst(NonZeroU32::new(5).unwrap()),
            )),

            // Create Match: 10 per minute (1 token per 6s)
            create_match_ip_limiter: Arc::new(RateLimiter::keyed(
                Quota::with_period(Duration::from_secs(6))
                    .unwrap()
                    .allow_burst(NonZeroU32::new(10).unwrap()),
            )),
        }
    }
}

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub rate_limiters: RateLimiters,

    pub email_repo: EmailRepo,
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

        let resend_client = Resend::new(&env::var("RESEND_KEY").expect("RESEND_KEY must be set"));
        let email_repo = EmailRepo { resend_client };

        let rate_limiters = RateLimiters::new();

        Self {
            pool: pool.clone(),
            rate_limiters,

            email_repo,
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

    let app = Router::new()
        .nest("/api", handlers::api_router())
        .layer(session_layer) // Handles sessions/auth
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
