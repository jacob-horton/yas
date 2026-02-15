use axum::{
    Json, Router,
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post, put},
};
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    extractors::{auth::AuthUser, validated_json::ValidatedJson},
    models::{
        group::{
            CreateGroupReq, GroupMemberResponse, GroupMembersParams, GroupResponse,
            GroupWithRoleResponse, OrderBy, SetRoleReq,
        },
        stats::OrderDir,
    },
    services,
};

async fn create_group(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    ValidatedJson(payload): ValidatedJson<CreateGroupReq>,
) -> Result<impl IntoResponse, AppError> {
    // TODO: check user email is validated before they can start creating groups

    let group = services::group::create_group(&state, user.id, payload).await?;

    let response: GroupResponse = group.into();
    Ok((StatusCode::CREATED, Json(response)))
}

async fn get_group_details(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Path(group_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let group = services::group::get_group(&state, user.id, group_id).await?;

    let response: GroupWithRoleResponse = group.into();
    Ok((StatusCode::OK, Json(response)))
}

async fn delete_group(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Path(group_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    services::group::delete_group(&state, user.id, group_id).await?;

    Ok(StatusCode::NO_CONTENT)
}

async fn get_group_members(
    State(state): State<AppState>,
    Query(query): Query<GroupMembersParams>,
    AuthUser(user): AuthUser,
    Path(group_id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let order_by = query.order_by.unwrap_or(OrderBy::Name);
    let order_dir = query.order_dir.unwrap_or(match order_by {
        OrderBy::Name | OrderBy::Email | OrderBy::JoinedAt => OrderDir::Ascending,
        OrderBy::Role => OrderDir::Descending,
    });

    let response =
        services::group::get_group_members(&state, user.id, group_id, order_by, order_dir).await?;

    Ok((StatusCode::OK, Json(response)))
}

async fn remove_group_member(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Path((group_id, member_id)): Path<(Uuid, Uuid)>,
) -> Result<impl IntoResponse, AppError> {
    services::group::remove_group_member(&state, user.id, group_id, member_id).await?;

    Ok(StatusCode::NO_CONTENT)
}

async fn set_member_role(
    State(state): State<AppState>,
    AuthUser(user): AuthUser,
    Path((group_id, member_id)): Path<(Uuid, Uuid)>,
    Json(payload): Json<SetRoleReq>,
) -> Result<impl IntoResponse, AppError> {
    services::group::set_member_role(&state, user.id, group_id, member_id, payload.role).await?;

    Ok(StatusCode::NO_CONTENT)
}

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/groups", post(create_group))
        .route("/groups/:id", get(get_group_details))
        .route("/groups/:id", delete(delete_group))
        .route("/groups/:id/members", get(get_group_members))
        .route(
            "/groups/:groupId/member/:memberId",
            delete(remove_group_member),
        )
        .route(
            "/groups/:groupId/member/:memberId/role",
            put(set_member_role),
        )
}
