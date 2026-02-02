use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Incorrect email or password")]
    InvalidCredentials,

    #[error("Invalid session")]
    InvalidSession,
}

#[derive(Debug, Error)]
pub enum UserError {
    #[error("User with this email already exists")]
    UserAlreadyExists,

    #[error("User not found")]
    NotFound,

    #[error("Not permitted to view user data")]
    NotPermittedToView,

    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

#[derive(Debug, Error)]
pub enum GroupError {
    #[error("You do not have permission to perform this action")]
    Forbidden,

    #[error("User is already a member of this group")]
    UserAlreadyMember,

    #[error("Group member not found")]
    MemberNotFound,

    #[error("Group not found")]
    NotFound,

    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

#[derive(Debug, Error)]
pub enum InviteError {
    #[error("Invite code not found")]
    NotFound,

    #[error("Invite has expired")]
    Expired,

    #[error("Limit reached")]
    LimitReached,

    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

#[derive(Debug, Error)]
pub enum GameError {
    #[error("Game not found")]
    NotFound,

    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

#[derive(Debug, Error)]
pub enum MatchError {
    #[error("Invalid user ID for score")]
    InvalidUserID,

    #[error(
        "Number of scores provided does not match the number of players per match for this game"
    )]
    IncorrectNumberOfScores,

    #[error("One or more players are not a member of this group")]
    OneOrMorePlayersNotMember,

    #[error("The same player was used in multiple scores")]
    DuplicatePlayer,

    #[error(transparent)]
    Database(#[from] sqlx::Error),
}

#[derive(Debug, Error)]
pub enum AppError {
    #[error(transparent)]
    Auth(#[from] AuthError),

    #[error(transparent)]
    Group(#[from] GroupError),

    #[error(transparent)]
    Invite(#[from] InviteError),

    #[error(transparent)]
    User(#[from] UserError),

    #[error(transparent)]
    Game(#[from] GameError),

    #[error(transparent)]
    Match(#[from] MatchError),

    #[error(transparent)]
    Database(#[from] sqlx::Error),

    #[error("Internal server error")]
    InternalServerError(String),

    #[error("Bad request")]
    BadRequest(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::Auth(err) => match err {
                AuthError::InvalidCredentials => (StatusCode::UNAUTHORIZED, err.to_string()),
                AuthError::InvalidSession => (StatusCode::UNAUTHORIZED, err.to_string()),
            },

            AppError::User(err) => match err {
                UserError::UserAlreadyExists => (StatusCode::CONFLICT, err.to_string()),
                UserError::NotFound => (StatusCode::NOT_FOUND, err.to_string()),
                UserError::NotPermittedToView => (StatusCode::FORBIDDEN, err.to_string()),
                UserError::Database(e) => {
                    eprintln!("User DB error: {:?}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Internal server error".to_string(),
                    )
                }
            },

            AppError::Group(err) => match err {
                GroupError::Forbidden => (StatusCode::FORBIDDEN, err.to_string()),
                GroupError::UserAlreadyMember => (StatusCode::CONFLICT, err.to_string()),
                GroupError::MemberNotFound => (StatusCode::NOT_FOUND, err.to_string()),
                GroupError::NotFound => (StatusCode::NOT_FOUND, err.to_string()),
                GroupError::Database(e) => {
                    eprintln!("Group DB error: {:?}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Internal server error".to_string(),
                    )
                }
            },

            AppError::Invite(err) => match err {
                InviteError::NotFound => (StatusCode::NOT_FOUND, err.to_string()),
                InviteError::Expired => (StatusCode::GONE, err.to_string()),
                InviteError::LimitReached => (StatusCode::GONE, err.to_string()),
                InviteError::Database(e) => {
                    eprintln!("Invite DB error: {:?}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Internal server error".to_string(),
                    )
                }
            },

            AppError::Game(err) => match err {
                GameError::NotFound => (StatusCode::NOT_FOUND, err.to_string()),
                GameError::Database(e) => {
                    eprintln!("Game DB error: {:?}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Internal server error".to_string(),
                    )
                }
            },

            AppError::Match(err) => match err {
                MatchError::InvalidUserID => (StatusCode::BAD_REQUEST, err.to_string()),
                MatchError::IncorrectNumberOfScores => (StatusCode::BAD_REQUEST, err.to_string()),
                MatchError::OneOrMorePlayersNotMember => (StatusCode::BAD_REQUEST, err.to_string()),
                MatchError::DuplicatePlayer => (StatusCode::BAD_REQUEST, err.to_string()),
                MatchError::Database(e) => {
                    eprintln!("Match DB error: {:?}", e);
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Internal server error".to_string(),
                    )
                }
            },

            AppError::InternalServerError(e) => {
                eprintln!("Internal server error: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal server error".to_string(),
                )
            }

            AppError::Database(e) => {
                eprintln!("Unknown DB Error: {:?}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal server error".to_string(),
                )
            }

            AppError::BadRequest(e) => (StatusCode::BAD_REQUEST, e),
        };

        let body = Json(serde_json::json!({
            "error": message
        }));

        (status, body).into_response()
    }
}
