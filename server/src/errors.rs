use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Incorrect username or password")]
    InvalidCredentials,

    #[error("Invalid session")]
    InvalidSession,
}

#[derive(Debug, Error)]
pub enum UserError {
    #[error("User with this username already exists")]
    UserAlreadyExists,

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
