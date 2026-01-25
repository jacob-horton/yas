use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
};

use crate::{
    AppState,
    errors::AppError,
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    models::invite::{
        CreateInviteReq, InviteBasicResponse, InviteDetailResponse, InviteSummaryResponse,
    },
    services,
};

pub async fn create_invite(
    Path((group_id,)): Path<(String,)>,
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    ValidatedJson(payload): ValidatedJson<CreateInviteReq>,
) -> Result<impl IntoResponse, AppError> {
    let group_id = group_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid group ID".to_string()))?;

    let invite = services::invite::create_link(&state, group_id, user.id, payload).await?;

    let response: InviteBasicResponse = invite.into();
    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn get_group_invites(
    Path((group_id,)): Path<(String,)>,
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let group_id = group_id
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid group ID".to_string()))?;

    let invites = services::invite::get_group_invites(&state, user.id, group_id).await?;

    let response: Vec<InviteSummaryResponse> =
        invites.into_iter().map(|invite| invite.into()).collect();
    Ok((StatusCode::CREATED, Json(response)))
}

async fn get_invite(
    Path((code,)): Path<(String,)>,
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let code = code
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid invite code".to_string()))?;

    let invite = services::invite::get_invite(&state, code).await?;
    let group = services::group::get_group_without_auth_check(&state, invite.group_id).await?;

    let in_group = state
        .group_repo
        .are_members(&state.pool, invite.group_id, &[user.id])
        .await?;

    let response = InviteDetailResponse {
        id: invite.id.to_string(),
        created_by_name: invite.created_by_name,
        expires_at: invite.expires_at,

        group_id: group.id.to_string(),
        group_name: group.name,

        is_current_user_member: in_group,
    };

    Ok((StatusCode::OK, Json(response)))
}

async fn accept_invite(
    Path((code,)): Path<(String,)>,
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let code = code
        .parse()
        .map_err(|_| AppError::BadRequest("Invalid invite code".to_string()))?;

    services::invite::accept_invite(&state, user.id, code).await?;

    Ok(StatusCode::NO_CONTENT)
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/groups/:id/invites", post(create_invite))
        .route("/groups/:id/invites", get(get_group_invites))
        .route("/invites/:code/accept", post(accept_invite))
        .route("/invites/:code", get(get_invite))
}
