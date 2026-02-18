use axum::{
    Json, Router,
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
};
use uuid::Uuid;

use crate::{
    AppState,
    errors::{AppError, GroupError},
    extractors::{
        auth::AuthUser, auth_member::AuthMember, validated_json::ValidatedJson,
        verified_member::VerifiedMember, verified_user::VerifiedUser,
    },
    models::invite::{
        CreateInviteReq, InviteBasicResponse, InviteDetailResponse, InviteSummaryResponse,
    },
    policies::GroupAction,
    services,
};

pub async fn create_invite(
    VerifiedMember(member): VerifiedMember,
    State(state): State<AppState>,
    ValidatedJson(payload): ValidatedJson<CreateInviteReq>,
) -> Result<impl IntoResponse, AppError> {
    let invite = services::invite::create_link(&state, member, payload).await?;

    let response: InviteBasicResponse = invite.into();
    Ok((StatusCode::CREATED, Json(response)))
}

pub async fn get_group_invites(
    AuthMember(member): AuthMember,
    State(state): State<AppState>,
) -> Result<impl IntoResponse, AppError> {
    let invites = services::invite::get_group_invites(&state, member).await?;

    let response: Vec<InviteSummaryResponse> =
        invites.into_iter().map(|invite| invite.into()).collect();
    Ok((StatusCode::CREATED, Json(response)))
}

async fn get_invite(
    Path(code): Path<Uuid>,
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
) -> Result<impl IntoResponse, AppError> {
    let invite = services::invite::get_invite(&state, code).await?;
    let group = services::group::get_group_raw(&state, invite.group_id).await?;

    let in_group = state
        .group_repo
        .get_member(&state.pool, invite.group_id, user.id)
        .await?
        .is_some();

    let response = InviteDetailResponse {
        id: invite.id,
        created_by_name: invite.created_by_name,
        expires_at: invite.expires_at,

        group_id: group.id,
        group_name: group.name,

        is_current_user_member: in_group,
    };

    Ok((StatusCode::OK, Json(response)))
}

async fn delete_invite(
    Path(code): Path<Uuid>,
    State(state): State<AppState>,
    VerifiedUser(user): VerifiedUser,
) -> Result<impl IntoResponse, AppError> {
    let invite = services::invite::get_invite(&state, code).await?;

    let member = state
        .group_repo
        .get_member(&state.pool, invite.group_id, user.id)
        .await?
        .ok_or(GroupError::MemberNotFound)?;

    if !member.role.can_perform(GroupAction::DeleteInvite) {
        return Err(GroupError::Forbidden.into());
    }

    services::invite::delete_invite(&state, code).await?;

    Ok(StatusCode::NO_CONTENT)
}

async fn accept_invite(
    Path(code): Path<Uuid>,
    State(state): State<AppState>,
    VerifiedUser(user): VerifiedUser,
) -> Result<impl IntoResponse, AppError> {
    services::invite::accept_invite(&state, user.id, code).await?;

    Ok(StatusCode::NO_CONTENT)
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/groups/:group_id/invites", post(create_invite))
        .route("/groups/:group_id/invites", get(get_group_invites))
        .route("/invites/:invite_code/accept", post(accept_invite))
        .route("/invites/:invite_code", get(get_invite))
        .route("/invites/:invite_code", delete(delete_invite))
}
